const db = require('../config/db');

const VALID_STATUSES = new Set(['pending', 'approved', 'rejected']);

const ensureAdvertisementsTable = async () => {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS advertisements (
      id INT AUTO_INCREMENT PRIMARY KEY,
      teacher_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      button_text VARCHAR(100) DEFAULT 'Learn More',
      button_link VARCHAR(500) DEFAULT NULL,
      status ENUM('pending','approved','rejected') DEFAULT 'pending',
      approved_by INT NULL,
      approved_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_ads_status (status),
      INDEX idx_ads_teacher (teacher_id),
      FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);
};

exports.createRequest = async (req, res) => {
  const teacherId = req.user.id;
  const { title, description, button_text, button_link } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required' });
  }

  try {
    await ensureAdvertisementsTable();

    const [result] = await db.execute(
      `INSERT INTO advertisements (teacher_id, title, description, button_text, button_link, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [
        teacherId,
        title.trim(),
        description.trim(),
        button_text?.trim() || 'Learn More',
        button_link?.trim() || null
      ]
    );

    res.status(201).json({ message: 'Advertisement request submitted', requestId: result.insertId });
  } catch (error) {
    console.error('Create advertisement request error:', error);
    res.status(500).json({ message: 'Server error creating advertisement request' });
  }
};

exports.getMyRequests = async (req, res) => {
  const teacherId = req.user.id;

  try {
    await ensureAdvertisementsTable();

    const [requests] = await db.execute(
      `SELECT id, title, description, button_text, button_link, status, created_at, approved_at
       FROM advertisements
       WHERE teacher_id = ?
       ORDER BY created_at DESC`,
      [teacherId]
    );

    res.status(200).json({ requests });
  } catch (error) {
    console.error('Get my advertisement requests error:', error);
    res.status(500).json({ message: 'Server error fetching advertisement requests' });
  }
};

exports.getAdminRequests = async (req, res) => {
  const status = req.query.status?.toLowerCase();

  try {
    await ensureAdvertisementsTable();

    let query = `
      SELECT
        a.id, a.title, a.description, a.button_text, a.button_link, a.status, a.created_at, a.approved_at,
        u.name AS teacher_name, u.email AS teacher_email
      FROM advertisements a
      JOIN users u ON u.id = a.teacher_id
    `;

    const params = [];
    if (status && VALID_STATUSES.has(status)) {
      query += ' WHERE a.status = ?';
      params.push(status);
    }

    query += ` ORDER BY FIELD(a.status, 'pending', 'approved', 'rejected'), a.created_at DESC`;

    const [requests] = await db.execute(query, params);
    res.status(200).json({ requests });
  } catch (error) {
    console.error('Get admin advertisement requests error:', error);
    res.status(500).json({ message: 'Server error fetching admin requests' });
  }
};

exports.approveRequest = async (req, res) => {
  const { requestId } = req.params;
  const adminId = req.user.id;

  try {
    await ensureAdvertisementsTable();

    const [existing] = await db.execute('SELECT id, status FROM advertisements WHERE id = ?', [requestId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Advertisement request not found' });
    }

    if (existing[0].status === 'approved') {
      return res.status(200).json({ message: 'Advertisement already approved' });
    }

    await db.execute(
      `UPDATE advertisements
       SET status = 'approved', approved_by = ?, approved_at = NOW()
       WHERE id = ?`,
      [adminId, requestId]
    );

    res.status(200).json({ message: 'Advertisement approved successfully' });
  } catch (error) {
    console.error('Approve advertisement request error:', error);
    res.status(500).json({ message: 'Server error approving advertisement request' });
  }
};

exports.rejectRequest = async (req, res) => {
  const { requestId } = req.params;
  const adminId = req.user.id;

  try {
    await ensureAdvertisementsTable();

    const [existing] = await db.execute('SELECT id FROM advertisements WHERE id = ?', [requestId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Advertisement request not found' });
    }

    await db.execute(
      `UPDATE advertisements
       SET status = 'rejected', approved_by = ?, approved_at = NULL
       WHERE id = ?`,
      [adminId, requestId]
    );

    res.status(200).json({ message: 'Advertisement rejected' });
  } catch (error) {
    console.error('Reject advertisement request error:', error);
    res.status(500).json({ message: 'Server error rejecting advertisement request' });
  }
};

exports.getApprovedAdvertisements = async (req, res) => {
  try {
    await ensureAdvertisementsTable();

    const [advertisements] = await db.execute(
      `SELECT
        a.id, a.title, a.description, a.button_text, a.button_link, a.created_at, a.approved_at,
        u.name AS teacher_name
       FROM advertisements a
       JOIN users u ON u.id = a.teacher_id
       WHERE a.status = 'approved'
       ORDER BY a.approved_at DESC, a.created_at DESC`
    );

    res.status(200).json({ advertisements });
  } catch (error) {
    console.error('Get approved advertisements error:', error);
    res.status(500).json({ message: 'Server error fetching advertisements' });
  }
};
