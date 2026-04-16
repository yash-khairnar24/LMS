const jwt = require('jsonwebtoken');
require('dotenv').config();
const { ADMIN_EMAIL } = require('../config/admin');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    req.user = decoded; // Contains id, role
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is invalid or expired' });
  }
};

const isTeacher = (req, res, next) => {
  if (req.user && req.user.role === 'teacher') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Requires teacher role' });
  }
};

const isBusiness = (req, res, next) => {
  if (req.user && req.user.role === 'business') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Requires business role' });
  }
};

const isAdmin = (req, res, next) => {
  const userEmail = req.user?.email?.toLowerCase?.();
  if (req.user?.isAdmin || userEmail === ADMIN_EMAIL.toLowerCase()) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Requires admin access' });
  }
};

module.exports = { verifyToken, isTeacher, isBusiness, isAdmin };
