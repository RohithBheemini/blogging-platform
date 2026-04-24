// routes/comments.js — Comment endpoints
const express = require('express');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/:postId/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId }).sort({ createdAt: -1 }).lean();
    for (const c of comments) {
      c.id = c._id.toString();
      c.authorId = c.author.toString();
    }
    res.json({ comments });
  } catch (err) {
    console.error('GET comments error:', err);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

router.post('/:postId/comments', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found.' });

    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content required.' });
    }

    const comment = new Comment({
      post: req.params.postId,
      author: req.user.id,
      authorName: req.user.username,
      content,
    });
    await comment.save();

    comment.id = comment._id.toString();
    comment.authorId = comment.author.toString();
    res.status(201).json({ comment });
  } catch (err) {
    console.error('POST comment error:', err);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

router.delete('/:postId/comments/:commentId', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found.' });

    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    await comment.deleteOne();

    res.json({ success: true });
  } catch (err) {
    console.error('DELETE comment error:', err);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

module.exports = router;