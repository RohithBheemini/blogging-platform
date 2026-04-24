// middleware/auth.js  —  JWT verification
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'inkwell-dev-secret';

function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided.' });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token.' });
  }
}

function optionalAuth(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload;
  } catch { /* ignore */ }
  next();
}

module.exports = { auth, optionalAuth, SECRET };