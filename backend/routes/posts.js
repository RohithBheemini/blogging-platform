// routes/posts.js — Post CRUD endpoints
const express = require('express');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { auth, optionalAuth } = require('../middleware/auth');

const CATEGORIES = [
  'Technology','Science','Culture','Philosophy',
  'Travel','Health','Business','Art','Personal','Other',
];

const router = express.Router();

router.get('/', optionalAuth, async (req, res) => {
  try {
    const { search, category } = req.query;
    const query = {};

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { title: { $regex: escaped, $options: 'i' } },
        { content: { $regex: escaped, $options: 'i' } },
      ];
    }
    if (category && category !== 'All') {
      query.category = category;
    }

    const posts = await Post.find(query).sort({ createdAt: -1 }).lean();

    const counts = await Comment.aggregate([
      { $match: { post: { $in: posts.map(p => p._id) } } },
      { $group: { _id: '$post', count: { $sum: 1 } } }
    ]);
    const countMap = new Map(counts.map(c => [c._id.toString(), c.count]));

    for (const post of posts) {
      post.id = post._id.toString();
      post.authorId = post.author.toString();
      post.commentCount = countMap.get(post._id.toString()) || 0;
    }

    res.json({ posts });
  } catch (err) {
    console.error('GET /posts error:', err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

router.get('/mine', auth, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user.id }).sort({ createdAt: -1 }).lean();

    const counts = await Comment.aggregate([
      { $match: { post: { $in: posts.map(p => p._id) } } },
      { $group: { _id: '$post', count: { $sum: 1 } } }
    ]);
    const countMap = new Map(counts.map(c => [c._id.toString(), c.count]));

    for (const post of posts) {
      post.id = post._id.toString();
      post.authorId = post.author.toString();
      post.commentCount = countMap.get(post._id.toString()) || 0;
    }

    res.json({ posts });
  } catch (err) {
    console.error('GET /posts/mine error:', err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).lean();
    if (!post) return res.status(404).json({ error: 'Post not found.' });

    post.id = post._id.toString();
    post.authorId = post.author.toString();
    post.commentCount = await Comment.countDocuments({ post: post._id });
    res.json({ post });
  } catch (err) {
    console.error('GET /posts/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, content, category } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content required.' });
    }

    if (category && !CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Invalid category.' });
    }

    const post = new Post({
      title,
      content,
      category: category || 'Personal',
      author: req.user.id,
      authorName: req.user.username,
    });
    await post.save();

    res.status(201).json({
      post: {
        id: post._id.toString(),
        title: post.title,
        content: post.content,
        category: post.category,
        authorId: post.author.toString(),
        authorName: post.authorName,
        commentCount: 0,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      }
    });
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    const { title, content, category } = req.body;
    if (title) post.title = title;
    if (content) post.content = content;
    if (category) {
      if (!CATEGORIES.includes(category)) {
        return res.status(400).json({ error: 'Invalid category.' });
      }
      post.category = category;
    }
    await post.save();

    res.json({ post });
  } catch (err) {
    console.error('PUT /posts/:id error:', err);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found.' });
  if (post.author.toString() !== req.user.id) {
    return res.status(403).json({ error: 'Not authorized.' });
  }

  await Comment.deleteMany({ post: post._id });
  await post.deleteOne();

  res.json({ success: true });
});

module.exports = router;