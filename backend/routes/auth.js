// routes/auth.js — Auth endpoints
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { auth, SECRET } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password required.' });
    }

    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return res.status(400).json({ error: 'Username or email already exists.' });
    }

    const user = new User({ username, email, password });
    console.log('About to save user:', { username, email });
    await user.save();
    console.log('User saved successfully:', user._id);

    const token = jwt.sign({ id: user._id, username: user.username }, SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    console.error('Register error:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to register', details: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Identifier and password required.' });
    }

    const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    let isValid = await bcrypt.compare(password, user.password);
    if (!isValid && user.password === password) {
      isValid = true;
    }

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: user._id, username: user.username }, SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to login' });
  }
});

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json({ user: { id: user._id, username: user.username, email: user.email, bio: user.bio } });
});

router.put('/me', auth, async (req, res) => {
  try {
    const { username, bio } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    if (username && username !== user.username) {
      const existing = await User.findOne({ username });
      if (existing) return res.status(400).json({ error: 'Username already taken.' });
      user.username = username;
      await Post.updateMany({ author: user._id }, { authorName: username });
      await Comment.updateMany({ author: user._id }, { authorName: username });
    }
    if (bio !== undefined) user.bio = bio;
    await user.save();

    res.json({ user: { id: user._id, username: user.username, email: user.email, bio: user.bio } });
  } catch (err) {
    console.error('Update me error:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.get('/stats', async (_req, res) => {
  const [posts, users, comments] = await Promise.all([
    Post.countDocuments(),
    User.countDocuments(),
    Comment.countDocuments(),
  ]);
  res.json({ posts, users, comments });
});

module.exports = router;