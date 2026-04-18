const db = require('../config/db');

// --- Teacher Endpoints ---

// Create a new class
exports.createClass = async (req, res) => {
  const { class_name, description } = req.body;
  const teacher_id = req.user.id;

  if (!class_name) {
    return res.status(400).json({ message: 'Class name is required' });
  }

  try {
    const { rows } = await db.query(
      'INSERT INTO classes (teacher_id, class_name, description) VALUES ($1, $2, $3) RETURNING id',
      [teacher_id, class_name, description || '']
    );

    res.status(201).json({
      message: 'Class created successfully',
      classId: rows[0].id
    });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ message: 'Server error creating class' });
  }
};

// Get all classes created by the (current) teacher — with real student count
exports.getTeacherClasses = async (req, res) => {
  const teacher_id = req.user.id;

  try {
    const { rows: classes } = await db.query(`
      SELECT c.*, COUNT(e.id) AS student_count
      FROM classes c
      LEFT JOIN enrollments e ON c.id = e.class_id
      WHERE c.teacher_id = $1
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `, [teacher_id]);
    res.status(200).json({ classes });
  } catch (error) {
    console.error('Get teacher classes error:', error);
    res.status(500).json({ message: 'Server error fetching classes' });
  }
};

// Update a class
exports.updateClass = async (req, res) => {
  const classId = req.params.id;
  const teacher_id = req.user.id;
  const { class_name, description } = req.body;

  if (!class_name) {
    return res.status(400).json({ message: 'Class name is required' });
  }

  try {
    const { rows: existing } = await db.query(
      'SELECT id FROM classes WHERE id = $1 AND teacher_id = $2',
      [classId, teacher_id]
    );
    if (existing.length === 0) {
      return res.status(403).json({ message: 'Not authorized to edit this class' });
    }

    await db.query(
      'UPDATE classes SET class_name = $1, description = $2 WHERE id = $3',
      [class_name, description || '', classId]
    );

    res.status(200).json({ message: 'Class updated successfully' });
  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({ message: 'Server error updating class' });
  }
};

// Delete a class
exports.deleteClass = async (req, res) => {
  const classId = req.params.id;
  const teacher_id = req.user.id;

  try {
    const { rows: existing } = await db.query(
      'SELECT id FROM classes WHERE id = $1 AND teacher_id = $2',
      [classId, teacher_id]
    );
    if (existing.length === 0) {
      return res.status(403).json({ message: 'Not authorized to delete this class' });
    }

    await db.query('DELETE FROM classes WHERE id = $1', [classId]);

    res.status(200).json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({ message: 'Server error deleting class' });
  }
};

// --- Student Endpoints ---

// Get all classes to browse
exports.getAllClasses = async (req, res) => {
  try {
    const { rows: classes } = await db.query(`
      SELECT c.*, u.name as teacher_name 
      FROM classes c
      JOIN users u ON c.teacher_id = u.id
      ORDER BY c.created_at DESC
    `);
    res.status(200).json({ classes });
  } catch (error) {
    console.error('Get all classes error:', error);
    res.status(500).json({ message: 'Server error fetching classes' });
  }
};

// Enroll in a class
exports.enrollClass = async (req, res) => {
  const { class_id } = req.body;
  const student_id = req.user.id;

  try {
    const { rows: existing } = await db.query(
      'SELECT id FROM enrollments WHERE student_id = $1 AND class_id = $2',
      [student_id, class_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Already enrolled in this class' });
    }

    await db.query(
      'INSERT INTO enrollments (student_id, class_id) VALUES ($1, $2)',
      [student_id, class_id]
    );

    res.status(201).json({ message: 'Enrolled successfully' });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ message: 'Server error during enrollment' });
  }
};

// Get all classes the student is enrolled in
exports.getStudentClasses = async (req, res) => {
  const student_id = req.user.id;

  try {
    const { rows: classes } = await db.query(`
      SELECT c.*, u.name as teacher_name 
      FROM classes c
      JOIN enrollments e ON c.id = e.class_id
      JOIN users u ON c.teacher_id = u.id
      WHERE e.student_id = $1
      ORDER BY e.created_at DESC
    `, [student_id]);
    
    res.status(200).json({ classes });
  } catch (error) {
    console.error('Get student classes error:', error);
    res.status(500).json({ message: 'Server error fetching enrolled classes' });
  }
};

// --- Common Endpoints ---

// Get single class details
exports.getClassDetails = async (req, res) => {
  const classId = req.params.id;

  try {
    const { rows: classes } = await db.query(`
      SELECT c.*, u.name as teacher_name 
      FROM classes c
      JOIN users u ON c.teacher_id = u.id
      WHERE c.id = $1
    `, [classId]);

    if (classes.length === 0) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.status(200).json({ class: classes[0] });
  } catch (error) {
    console.error('Get class details error:', error);
    res.status(500).json({ message: 'Server error fetching class details' });
  }
};
