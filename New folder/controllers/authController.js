const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { ADMIN_EMAIL, ADMIN_PASSWORD } = require('../config/admin');

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (role !== 'teacher' && role !== 'student' && role !== 'business') {
    return res.status(400).json({ message: 'Invalid role' });
  }

  if (email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    return res.status(403).json({ message: 'This email is reserved for admin access' });
  }

  try {
    // Check if user already exists
    const [existingUsers] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );

    res.status(201).json({
      message: 'User registered successfully',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    // Hardcoded admin login (as requested)
    if (normalizedEmail === ADMIN_EMAIL.toLowerCase()) {
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: 'Invalid admin credentials' });
      }

      let [admins] = await db.execute('SELECT * FROM users WHERE email = ?', [ADMIN_EMAIL]);
      let adminUser = admins[0];

      // Auto-create admin record if missing so all foreign-key relations keep working.
      if (!adminUser) {
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
        const [insertResult] = await db.execute(
          'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
          ['System Admin', ADMIN_EMAIL, hashedPassword, 'teacher']
        );

        adminUser = {
          id: insertResult.insertId,
          name: 'System Admin',
          email: ADMIN_EMAIL,
          role: 'teacher'
        };
      }

      const token = jwt.sign(
        {
          id: adminUser.id,
          role: adminUser.role,
          name: adminUser.name,
          email: ADMIN_EMAIL,
          isAdmin: true
        },
        process.env.JWT_SECRET || 'fallback_secret_key',
        { expiresIn: '1d' }
      );

      return res.status(200).json({
        message: 'Admin logged in successfully',
        token,
        user: {
          id: adminUser.id,
          name: adminUser.name,
          email: ADMIN_EMAIL,
          role: adminUser.role,
          isAdmin: true
        }
      });
    }

    const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name, email: user.email, isAdmin: false },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: false
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};
