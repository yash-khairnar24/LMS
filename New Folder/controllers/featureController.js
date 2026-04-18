const db = require('../config/db');

// --- Live Classes (Meetings & Sessions) ---
exports.getLiveClasses = async (req, res) => {
  const student_id = req.user.id;
  try {
    const { rows: meetings } = await db.query(`
      SELECT m.id, m.topic as title, m.meeting_code, m.is_active as isLive,
             m.started_at as time, c.class_name as subject, u.name as teacher
      FROM meetings m
      JOIN classes c ON m.class_id = c.id
      JOIN enrollments e ON c.id = e.class_id
      JOIN users u ON c.teacher_id = u.id
      WHERE e.student_id = $1
      ORDER BY m.started_at DESC
    `, [student_id]);

    const formattedSessions = meetings.map(m => ({
      id: m.id,
      title: m.title,
      teacher: m.teacher,
      subject: m.subject,
      time: new Date(m.time).toLocaleString(),
      students: 0,
      isLive: Boolean(m.islive),
      code: m.meeting_code
    }));

    res.status(200).json({ sessions: formattedSessions });
  } catch (error) {
    console.error('Get live classes error:', error);
    res.status(500).json({ message: 'Server error fetching live classes' });
  }
};

// --- Study Materials ---
exports.getStudyMaterials = async (req, res) => {
  const student_id = req.user.id;
  try {
    const { rows: materials } = await db.query(`
      SELECT m.id, m.title, m.file_path, m.created_at, 
             c.class_name as subject, u.name as teacher
      FROM materials m
      JOIN classes c ON m.class_id = c.id
      JOIN enrollments e ON c.id = e.class_id
      JOIN users u ON c.teacher_id = u.id
      WHERE e.student_id = $1
      ORDER BY m.created_at DESC
    `, [student_id]);

    const formattedMaterials = materials.map(m => ({
      id: m.id,
      title: m.title,
      type: 'PDF',
      size: 'Unknown',
      subject: m.subject,
      teacher: m.teacher,
      pages: 0,
      downloads: 0,
      url: `http://localhost:5000${m.file_path}`
    }));

    res.status(200).json({ materials: formattedMaterials });
  } catch (error) {
    console.error('Get study materials error:', error);
    res.status(500).json({ message: 'Server error fetching materials' });
  }
};

// --- Recordings (Lectures) ---
exports.getRecordings = async (req, res) => {
  const student_id = req.user.id;
  try {
    const { rows: lectures } = await db.query(`
      SELECT l.id, l.title, l.video_url, l.created_at,
      c.class_name as subject, u.name as teacher
      FROM lectures l
      JOIN classes c ON l.class_id = c.id
      JOIN enrollments e ON c.id = e.class_id
      JOIN users u ON c.teacher_id = u.id
      WHERE e.student_id = $1
      ORDER BY l.created_at DESC
    `, [student_id]);

    const formattedRecordings = lectures.map(l => ({
      id: l.id,
      title: l.title,
      teacher: l.teacher,
      date: new Date(l.created_at).toLocaleDateString(),
      duration: 'Unknown',
      views: 0,
      subject: l.subject,
      url: l.video_url
    }));

    res.status(200).json({ recordings: formattedRecordings });
  } catch (error) {
    console.error('Get recordings error:', error);
    res.status(500).json({ message: 'Server error fetching recordings' });
  }
};

// --- Assignments ---
exports.getAssignments = async (req, res) => {
  const student_id = req.user.id;
  try {
    const { rows: assignments } = await db.query(`
      SELECT a.id, a.title, a.due_date as due, a.max_marks as marks,
      c.class_name as subject, u.name as teacher,
      s.id as submission_id, s.score, s.status
      FROM assignments a
      JOIN classes c ON a.class_id = c.id
      JOIN enrollments e ON c.id = e.class_id
      JOIN users u ON c.teacher_id = u.id
      LEFT JOIN assignment_submissions s ON a.id = s.assignment_id AND s.student_id = $1
      WHERE e.student_id = $2
      ORDER BY a.due_date ASC
    `, [student_id, student_id]);

    const formattedAssignments = assignments.map(a => {
      const isPastDue = new Date(a.due) < new Date();
      let status = 'pending';
      if (a.submission_id) {
        status = a.status || 'submitted';
      } else if (isPastDue) {
        status = 'overdue';
      }

      return {
        id: a.id,
        title: a.title,
        subject: a.subject,
        teacher: a.teacher,
        due: new Date(a.due).toLocaleDateString(),
        status: status,
        marks: String(a.marks),
        submitted: !!a.submission_id,
        score: a.score ? `${a.score} / ${a.marks}` : null
      };
    });

    res.status(200).json({ assignments: formattedAssignments });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ message: 'Server error fetching assignments' });
  }
};

// --- TEACHER ACTIONS ---

exports.uploadMaterial = async (req, res) => {
  const teacher_id = req.user.id;
  const { class_id, title } = req.body;
  const file = req.file;

  if (!class_id || !title || !file) {
    return res.status(400).json({ message: 'Class, title, and file are required' });
  }

  try {
    const { rows: existing } = await db.query(
      'SELECT id FROM classes WHERE id = $1 AND teacher_id = $2',
      [class_id, teacher_id]
    );
    if (existing.length === 0) return res.status(403).json({ message: 'Not authorized' });

    const file_path = `/uploads/${file.filename}`;
    await db.query(
      'INSERT INTO materials (class_id, title, file_path, file_type) VALUES ($1, $2, $3, $4)',
      [class_id, title, file_path, file.mimetype]
    );

    res.status(201).json({ message: 'Material uploaded successfully' });
  } catch (error) {
    console.error('Upload material error:', error);
    res.status(500).json({ message: 'Server error uploading material' });
  }
};

exports.createAssignment = async (req, res) => {
  const teacher_id = req.user.id;
  const { class_id, title, due_date, max_marks } = req.body;

  if (!class_id || !title || !due_date || !max_marks) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const { rows: existing } = await db.query(
      'SELECT id FROM classes WHERE id = $1 AND teacher_id = $2',
      [class_id, teacher_id]
    );
    if (existing.length === 0) return res.status(403).json({ message: 'Not authorized' });

    await db.query(
      'INSERT INTO assignments (class_id, title, due_date, max_marks) VALUES ($1, $2, $3, $4)',
      [class_id, title, due_date, max_marks]
    );

    res.status(201).json({ message: 'Assignment created successfully' });
  } catch (error) {
    console.error('Create assignment error:', error.message);
    res.status(500).json({ message: 'Server error creating assignment', error: error.message });
  }
};

// --- TEACHER: Get My Materials ---
exports.getTeacherMaterials = async (req, res) => {
  const teacher_id = req.user.id;
  try {
    const { rows: materials } = await db.query(`
      SELECT m.id, m.title, m.file_path, m.file_type, m.created_at, c.class_name
      FROM materials m
      JOIN classes c ON m.class_id = c.id
      WHERE c.teacher_id = $1
      ORDER BY m.created_at DESC
    `, [teacher_id]);
    res.status(200).json({ materials });
  } catch (error) {
    console.error('Get teacher materials error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// --- TEACHER: Get My Assignments (with submission stats) ---
exports.getTeacherAssignments = async (req, res) => {
  const teacher_id = req.user.id;
  try {
    const { rows: assignments } = await db.query(`
      SELECT a.id, a.title, a.due_date, a.max_marks, a.created_at,
             c.class_name,
             COUNT(s.id) as submission_count
      FROM assignments a
      JOIN classes c ON a.class_id = c.id
      LEFT JOIN assignment_submissions s ON a.id = s.assignment_id
      WHERE c.teacher_id = $1
      GROUP BY a.id, a.title, a.due_date, a.max_marks, a.created_at, c.class_name
      ORDER BY a.due_date ASC
    `, [teacher_id]);
    res.status(200).json({ assignments });
  } catch (error) {
    console.error('Get teacher assignments error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// --- TEACHER: Smart Test — Student Scores ---
exports.getSmartTestResults = async (req, res) => {
  const teacher_id = req.user.id;
  try {
    const { rows: results } = await db.query(`
      SELECT a.title as assignment_title, c.class_name,
             u.name as student_name, s.score, a.max_marks,
             s.status, s.submitted_at
      FROM assignment_submissions s
      JOIN assignments a ON s.assignment_id = a.id
      JOIN classes c ON a.class_id = c.id
      JOIN users u ON s.student_id = u.id
      WHERE c.teacher_id = $1 AND s.status = 'graded'
      ORDER BY s.submitted_at DESC
    `, [teacher_id]);
    res.status(200).json({ results });
  } catch (error) {
    console.error('Get smart test results error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
