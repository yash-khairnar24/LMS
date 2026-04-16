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

// Teacher creates a new meeting session
exports.createMeeting = async (req, res) => {
  const teacher_id = req.user.id;
  const { class_id, title } = req.body;

  if (!class_id || !title) return res.status(400).json({ message: 'Class and title are required' });

  try {
    const [cls] = await db.execute('SELECT id FROM classes WHERE id = ? AND teacher_id = ?', [class_id, teacher_id]);
    if (cls.length === 0) return res.status(403).json({ message: 'Not authorized' });

    let code = generateCode();
    // Ensure uniqueness
    let [existing] = await db.execute('SELECT id FROM meetings WHERE meeting_code = ?', [code]);
    while (existing.length > 0) {
      code = generateCode();
      [existing] = await db.execute('SELECT id FROM meetings WHERE meeting_code = ?', [code]);
    }

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
  const student_id = req.user.id;
  const { meeting_code } = req.body;

  if (!meeting_code) return res.status(400).json({ message: 'Meeting code is required' });

  try {
    const [meetings] = await db.execute(
      `SELECT m.*, c.class_name, u.name as teacher_name
       FROM meetings m
       JOIN classes c ON m.class_id = c.id
       JOIN users u ON m.teacher_id = u.id
       WHERE m.meeting_code = ? AND m.is_active = TRUE`,
      [meeting_code.toUpperCase()]
    );

    if (meetings.length === 0) {
      return res.status(404).json({ message: 'Invalid or expired meeting code' });
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
