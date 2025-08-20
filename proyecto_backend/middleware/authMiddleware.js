const jwt = require('jsonwebtoken');
require('dotenv').config();

const isAuthenticated = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    console.error('Authentication failed: No token provided');
    return res.status(401).json({ ok: false, msg: 'not-authenticated' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = { idUsuario: decoded.idUsuario, username: decoded.username };
    next();
  } catch (error) {
    console.error(`Authentication failed: ${error.message}`);
    return res.status(401).json({ ok: false, msg: 'invalid-token' });
  }
};

module.exports = { isAuthenticated };