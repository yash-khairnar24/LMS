const db = require('../config/db');

const VALID_STATUSES = new Set(['pending', 'approved', 'rejected']);

const ensureAdvertisementsTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS advertisements (
      id SERIAL PRIMARY KEY,
      teacher_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      button_text VARCHAR(100) DEFAULT 'Learn More',
      button_link VARCHAR(500) DEFAULT NULL,
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      approved_by INT NULL,
      approved_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);
  await db.query(`CREATE INDEX IF NOT EXISTS idx_ads_status ON advertisements(status)`);
  await db.query(`CREATE INDEX IF NOT EXISTS idx_ads_teacher ON advertisements(teacher_id)`);
};

exports.createRequest = async (req, res) => {
  const teacherId = req.user.id;
  const { title, description, button_text, button_link } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required' });
  }

  try {
    await ensureAdvertisementsTable();

    const { rows } = await db.query(
      `INSERT INTO advertisements (teacher_id, title, description, button_text, button_link, status)
       VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING id`,
      [
        teacherId,
        title.trim(),
        description.trim(),
        button_text?.trim() || 'Learn More',
        button_link?.trim() || null
      ]
    );

    res.status(201).json({ message: 'Advertisement request submitted', requestId: rows[0].id });
  } catch (error) {
    console.error('Create advertisement request error:', error);
    res.status(500).json({ message: 'Server error creating advertisement request' });
  }
};

exports.getMyRequests = async (req, res) => {
  const teacherId = req.user.id;

  try {
    await ensureAdvertisementsTable();

    const { rows: requests } = await db.query(
      `SELECT id, title, description, button_text, button_link, status, created_at, approved_at
       FROM advertisements
       WHERE teacher_id = $1
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
      query += ' WHERE a.status = $1';
      params.push(status);
    }

    // In PostgreSQL, array position can be used but standard case is better or just standard ordering
    // PostgreSQL doesn't have FIELD() function out of the box like MySQL.
    // We can use CASE WHEN to order specific statuses
    query += ` ORDER BY 
      CASE a.status 
        WHEN 'pending' THEN 1 
        WHEN 'approved' THEN 2 
        WHEN 'rejected' THEN 3 
        ELSE 4 
      END, a.created_at DESC`;

    const { rows: requests } = await db.query(query, params);
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

    const { rows: existing } = await db.query('SELECT id, status FROM advertisements WHERE id = $1', [requestId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Advertisement request not found' });
    }

    if (existing[0].status === 'approved') {
      return res.status(200).json({ message: 'Advertisement already approved' });
    }

    await db.query(
      `UPDATE advertisements
       SET status = 'approved', approved_by = $1, approved_at = NOW()
       WHERE id = $2`,
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

    const { rows: existing } = await db.query('SELECT id FROM advertisements WHERE id = $1', [requestId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Advertisement request not found' });
    }

    await db.query(
      `UPDATE advertisements
       SET status = 'rejected', approved_by = $1, approved_at = NULL
       WHERE id = $2`,
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

    const { rows: advertisements } = await db.query(
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
