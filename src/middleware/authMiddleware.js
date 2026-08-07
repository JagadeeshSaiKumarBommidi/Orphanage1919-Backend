const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'avg_orphanage_secure_jwt_secret_key_1919');
    req.user = decoded;
    next();
  } catch (err) {
    console.error(`Auth rejected [${req.method} ${req.originalUrl}]: ${err.name} - ${err.message}`);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};
