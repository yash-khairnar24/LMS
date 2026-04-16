const db = require('../config/db');

// ─── PLAN ENDPOINTS (Teacher) ───────────────────────────────────────────────

// Get all plans for a class
exports.getPlans = async (req, res) => {
  const { classId } = req.params;
  try {
    const [plans] = await db.execute(
      'SELECT * FROM plans WHERE class_id = ? ORDER BY price ASC',
      [classId]
    );
    res.status(200).json({ plans });
  } catch (err) {
    console.error('Get plans error:', err);
    res.status(500).json({ message: 'Server error fetching plans' });
  }
};

// Create a plan (teacher only)
exports.createPlan = async (req, res) => {
  const teacher_id = req.user.id;
  const { classId } = req.params;
  const {
    name, price,
    feature_live_class, feature_study_material, feature_ask_doubt,
    feature_recording, feature_assignment, feature_smart_test,
    feature_chat, feature_support
  } = req.body;

  if (!name) return res.status(400).json({ message: 'Plan name is required' });

  try {
    // Ensure class belongs to teacher
    const [cls] = await db.execute('SELECT id FROM classes WHERE id = ? AND teacher_id = ?', [classId, teacher_id]);
    if (cls.length === 0) return res.status(403).json({ message: 'Not authorized' });

    const [result] = await db.execute(
      `INSERT INTO plans (class_id, name, price,
        feature_live_class, feature_study_material, feature_ask_doubt,
        feature_recording, feature_assignment, feature_smart_test,
        feature_chat, feature_support)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        classId, name, price || 0,
        !!feature_live_class, !!feature_study_material, !!feature_ask_doubt,
        !!feature_recording, !!feature_assignment, !!feature_smart_test,
        !!feature_chat, feature_support !== false
      ]
    );
    res.status(201).json({ message: 'Plan created', planId: result.insertId });
  } catch (err) {
    console.error('Create plan error:', err);
    res.status(500).json({ message: 'Server error creating plan' });
  }
};

// Update a plan (teacher only)
exports.updatePlan = async (req, res) => {
  const teacher_id = req.user.id;
  const { planId } = req.params;
  const {
    name, price,
    feature_live_class, feature_study_material, feature_ask_doubt,
    feature_recording, feature_assignment, feature_smart_test,
    feature_chat, feature_support
  } = req.body;

  try {
    const [plan] = await db.execute(
      'SELECT p.id FROM plans p JOIN classes c ON p.class_id = c.id WHERE p.id = ? AND c.teacher_id = ?',
      [planId, teacher_id]
    );
    if (plan.length === 0) return res.status(403).json({ message: 'Not authorized' });

    await db.execute(
      `UPDATE plans SET name=?, price=?,
        feature_live_class=?, feature_study_material=?, feature_ask_doubt=?,
        feature_recording=?, feature_assignment=?, feature_smart_test=?,
        feature_chat=?, feature_support=?
       WHERE id=?`,
      [
        name, price || 0,
        !!feature_live_class, !!feature_study_material, !!feature_ask_doubt,
        !!feature_recording, !!feature_assignment, !!feature_smart_test,
        !!feature_chat, feature_support !== false,
        planId
      ]
    );
    res.status(200).json({ message: 'Plan updated' });
  } catch (err) {
    console.error('Update plan error:', err);
    res.status(500).json({ message: 'Server error updating plan' });
  }
};

// Delete a plan (teacher only)
exports.deletePlan = async (req, res) => {
  const teacher_id = req.user.id;
  const { planId } = req.params;
  try {
    const [plan] = await db.execute(
      'SELECT p.id FROM plans p JOIN classes c ON p.class_id = c.id WHERE p.id = ? AND c.teacher_id = ?',
      [planId, teacher_id]
    );
    if (plan.length === 0) return res.status(403).json({ message: 'Not authorized' });

    await db.execute('DELETE FROM plans WHERE id = ?', [planId]);
    res.status(200).json({ message: 'Plan deleted' });
  } catch (err) {
    console.error('Delete plan error:', err);
    res.status(500).json({ message: 'Server error deleting plan' });
  }
};

// ─── SUBSCRIPTION ENDPOINTS (Student) ───────────────────────────────────────

// Student subscribes to a plan (simulated payment)
exports.subscribe = async (req, res) => {
  const student_id = req.user.id;
  const { plan_id, class_id } = req.body;

  try {
    // Check if already subscribed to this class
    const [existing] = await db.execute(
      'SELECT id FROM subscriptions WHERE student_id = ? AND class_id = ?',
      [student_id, class_id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Already subscribed to this class' });
    }

    // Verify plan belongs to class
    const [plan] = await db.execute('SELECT id FROM plans WHERE id = ? AND class_id = ?', [plan_id, class_id]);
    if (plan.length === 0) return res.status(400).json({ message: 'Invalid plan' });

    await db.execute(
      'INSERT INTO subscriptions (student_id, class_id, plan_id, payment_status) VALUES (?, ?, ?, ?)',
      [student_id, class_id, plan_id, 'completed']
    );

    // Also auto-enroll in class if not already
    const [enrolled] = await db.execute(
      'SELECT id FROM enrollments WHERE student_id = ? AND class_id = ?',
      [student_id, class_id]
    );
    if (enrolled.length === 0) {
      await db.execute('INSERT INTO enrollments (student_id, class_id) VALUES (?, ?)', [student_id, class_id]);
    }

    res.status(201).json({ message: 'Subscription successful' });
  } catch (err) {
    console.error('Subscribe error:', err);
    res.status(500).json({ message: 'Server error during subscription' });
  }
};

// Get student's subscription for a class
exports.getMySubscription = async (req, res) => {
  const student_id = req.user.id;
  const { classId } = req.params;
  try {
    const [rows] = await db.execute(
      `SELECT s.*, p.name as plan_name, p.price,
        p.feature_live_class, p.feature_study_material, p.feature_ask_doubt,
        p.feature_recording, p.feature_assignment, p.feature_smart_test,
        p.feature_chat, p.feature_support
       FROM subscriptions s
       JOIN plans p ON s.plan_id = p.id
       WHERE s.student_id = ? AND s.class_id = ?`,
      [student_id, classId]
    );
    if (rows.length === 0) return res.status(200).json({ subscription: null });
    res.status(200).json({ subscription: rows[0] });
  } catch (err) {
    console.error('Get subscription error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── MEETING ENDPOINTS ───────────────────────────────────────────────────────

// Generate a unique 8-char meeting code
function generateCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

const ensureBusinessMeetingsTable = async () => {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS business_meetings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      host_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      meeting_code VARCHAR(20) UNIQUE NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_business_meetings_host (host_id),
      INDEX idx_business_meetings_code (meeting_code),
      FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
};

const ensureBusinessMeetingParticipantsTable = async () => {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS business_meeting_participants (
      id INT AUTO_INCREMENT PRIMARY KEY,
      meeting_id INT NOT NULL,
      user_id INT NOT NULL,
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_business_meeting_user (meeting_id, user_id),
      INDEX idx_bmp_meeting (meeting_id),
      INDEX idx_bmp_user (user_id),
      FOREIGN KEY (meeting_id) REFERENCES business_meetings(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
};

const generateUniqueMeetingCode = async () => {
  let code = generateCode();
  let isUnique = false;

  while (!isUnique) {
    await ensureBusinessMeetingsTable();
    await ensureBusinessMeetingParticipantsTable();

    const [existingClassMeeting] = await db.execute(
      'SELECT id FROM meetings WHERE meeting_code = ? LIMIT 1',
      [code]
    );
    const [existingBusinessMeeting] = await db.execute(
      'SELECT id FROM business_meetings WHERE meeting_code = ? LIMIT 1',
      [code]
    );

    isUnique = existingClassMeeting.length === 0 && existingBusinessMeeting.length === 0;
    if (!isUnique) code = generateCode();
  }

  return code;
};

// Teacher creates a new meeting session
exports.createMeeting = async (req, res) => {
  const teacher_id = req.user.id;
  const { class_id, title } = req.body;

  if (!class_id || !title) return res.status(400).json({ message: 'Class and title are required' });

  try {
    await ensureBusinessMeetingsTable();

    const [cls] = await db.execute('SELECT id FROM classes WHERE id = ? AND teacher_id = ?', [class_id, teacher_id]);
    if (cls.length === 0) return res.status(403).json({ message: 'Not authorized' });

    const code = await generateUniqueMeetingCode();

    const [result] = await db.execute(
      'INSERT INTO meetings (class_id, teacher_id, title, meeting_code) VALUES (?, ?, ?, ?)',
      [class_id, teacher_id, title, code]
    );

    res.status(201).json({ message: 'Meeting created', meeting_code: code, meetingId: result.insertId });
  } catch (err) {
    console.error('Create meeting error:', err);
    res.status(500).json({ message: 'Server error creating meeting' });
  }
};

// Get all meetings for a class (teacher)
exports.getMeetings = async (req, res) => {
  const { classId } = req.params;
  try {
    const [meetings] = await db.execute(
      'SELECT * FROM meetings WHERE class_id = ? ORDER BY created_at DESC',
      [classId]
    );
    res.status(200).json({ meetings });
  } catch (err) {
    console.error('Get meetings error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Student joins a meeting by code
exports.joinByCode = async (req, res) => {
  const { meeting_code } = req.body;

  if (!meeting_code) return res.status(400).json({ message: 'Meeting code is required' });

  try {
    await ensureBusinessMeetingsTable();
    await ensureBusinessMeetingParticipantsTable();

    const [meetings] = await db.execute(
      `SELECT m.*, c.class_name, u.name as teacher_name
       FROM meetings m
       JOIN classes c ON m.class_id = c.id
       JOIN users u ON m.teacher_id = u.id
       WHERE m.meeting_code = ? AND m.is_active = TRUE`,
      [meeting_code.toUpperCase()]
    );

    if (meetings.length === 0) {
      const [businessMeetings] = await db.execute(
        `SELECT
          bm.id,
          bm.meeting_code,
          bm.title,
          bm.is_active,
          bm.created_at,
          bm.host_id AS teacher_id,
          NULL AS class_id,
          u.name AS host_name,
          'Business Live Session' AS group_name,
          'business' AS meeting_type
        FROM business_meetings bm
        JOIN users u ON u.id = bm.host_id
        WHERE bm.meeting_code = ? AND bm.is_active = TRUE`,
        [meeting_code.toUpperCase()]
      );

      if (businessMeetings.length === 0) {
        return res.status(404).json({ message: 'Invalid or expired meeting code' });
      }

      return res.status(200).json({ meeting: businessMeetings[0] });
    }

    res.status(200).json({ meeting: meetings[0] });
  } catch (err) {
    console.error('Join by code error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle meeting active status (teacher ends meeting)
exports.toggleMeeting = async (req, res) => {
  const teacher_id = req.user.id;
  const { meetingId } = req.params;
  try {
    const [meeting] = await db.execute('SELECT * FROM meetings WHERE id = ? AND teacher_id = ?', [meetingId, teacher_id]);
    if (meeting.length === 0) return res.status(403).json({ message: 'Not authorized' });

    await db.execute('UPDATE meetings SET is_active = ? WHERE id = ?', [!meeting[0].is_active, meetingId]);
    res.status(200).json({ message: 'Meeting status updated' });
  } catch (err) {
    console.error('Toggle meeting error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Business user creates a code-based live meeting
exports.createBusinessMeeting = async (req, res) => {
  const host_id = req.user.id;
  const { title } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Meeting title is required' });
  }

  try {
    await ensureBusinessMeetingsTable();
    await ensureBusinessMeetingParticipantsTable();
    const code = await generateUniqueMeetingCode();

    const [result] = await db.execute(
      'INSERT INTO business_meetings (host_id, title, meeting_code, is_active) VALUES (?, ?, ?, TRUE)',
      [host_id, title.trim(), code]
    );

    res.status(201).json({
      message: 'Business meeting created',
      meetingId: result.insertId,
      meeting_code: code
    });
  } catch (err) {
    console.error('Create business meeting error:', err);
    res.status(500).json({ message: 'Server error creating meeting' });
  }
};

// Business user sees own created meetings
exports.getBusinessMeetings = async (req, res) => {
  const host_id = req.user.id;

  try {
    await ensureBusinessMeetingsTable();
    await ensureBusinessMeetingParticipantsTable();

    const [meetings] = await db.execute(
      `SELECT
        bm.id,
        bm.title,
        bm.meeting_code,
        bm.is_active,
        bm.created_at,
        COUNT(bmp.user_id) AS joined_count
       FROM business_meetings bm
       LEFT JOIN business_meeting_participants bmp ON bmp.meeting_id = bm.id
       WHERE bm.host_id = ?
       GROUP BY bm.id, bm.title, bm.meeting_code, bm.is_active, bm.created_at
       ORDER BY bm.created_at DESC`,
      [host_id]
    );

    res.status(200).json({ meetings });
  } catch (err) {
    console.error('Get business meetings error:', err);
    res.status(500).json({ message: 'Server error fetching meetings' });
  }
};

// Business user toggles meeting active/inactive
exports.toggleBusinessMeeting = async (req, res) => {
  const host_id = req.user.id;
  const { meetingId } = req.params;

  try {
    await ensureBusinessMeetingsTable();
    await ensureBusinessMeetingParticipantsTable();

    const [meeting] = await db.execute(
      'SELECT id, is_active FROM business_meetings WHERE id = ? AND host_id = ?',
      [meetingId, host_id]
    );

    if (meeting.length === 0) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const newStatus = !meeting[0].is_active;
    await db.execute('UPDATE business_meetings SET is_active = ? WHERE id = ?', [newStatus, meetingId]);

    res.status(200).json({ message: 'Meeting status updated', is_active: newStatus });
  } catch (err) {
    console.error('Toggle business meeting error:', err);
    res.status(500).json({ message: 'Server error updating meeting status' });
  }
};

// Track a unique participant joining a business meeting
exports.trackBusinessMeetingJoin = async (req, res) => {
  const user_id = req.user.id;
  const { meetingId } = req.params;

  try {
    await ensureBusinessMeetingsTable();
    await ensureBusinessMeetingParticipantsTable();

    const [meeting] = await db.execute(
      'SELECT id FROM business_meetings WHERE id = ? AND is_active = TRUE',
      [meetingId]
    );

    if (meeting.length === 0) {
      return res.status(404).json({ message: 'Active business meeting not found' });
    }

    await db.execute(
      `INSERT INTO business_meeting_participants (meeting_id, user_id)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE joined_at = joined_at`,
      [meetingId, user_id]
    );

    const [rows] = await db.execute(
      'SELECT COUNT(*) AS joined_count FROM business_meeting_participants WHERE meeting_id = ?',
      [meetingId]
    );

    res.status(200).json({ message: 'Join tracked', joined_count: rows[0]?.joined_count || 0 });
  } catch (err) {
    console.error('Track business meeting join error:', err);
    res.status(500).json({ message: 'Server error tracking join' });
  }
};
