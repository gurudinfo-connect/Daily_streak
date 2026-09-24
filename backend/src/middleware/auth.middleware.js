const jwt = require('jsonwebtoken');

// Derives the authenticated user's identity ONLY from a verified JWT.
// Nothing in the request body (userId, etc.) is ever trusted for ownership —
// see streak.controller.js, which never reads req.body.userId.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, code: 'NO_TOKEN', message: 'Please log in to continue.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, code: 'INVALID_TOKEN', message: 'Please log in to continue.' });
  }
}

module.exports = { requireAuth };
