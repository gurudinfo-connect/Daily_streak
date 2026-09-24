const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

function signToken(userId) {
  return jwt.sign({ sub: userId.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

const register = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, code: 'VALIDATION', message: 'Email and password are required.' });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ success: false, code: 'EMAIL_TAKEN', message: 'An account with that email already exists.' });
  }

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({ email: email.toLowerCase(), passwordHash, name: name || '' });

  const token = signToken(user._id);
  res.status(201).json({ success: true, token, user: { id: user._id, email: user.email, name: user.name } });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });
  if (!user || !(await user.comparePassword(password || ''))) {
    return res.status(401).json({ success: false, code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' });
  }
  if (!user.isActive) {
    return res.status(403).json({ success: false, code: 'ACCOUNT_DISABLED', message: 'This account is not eligible.' });
  }

  const token = signToken(user._id);
  res.json({ success: true, token, user: { id: user._id, email: user.email, name: user.name } });
});

const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).select('email name createdAt');
  res.json({ success: true, user });
});

module.exports = { register, login, me };
