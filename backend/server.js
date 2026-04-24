// server.js — Inkwell Blog API
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { connect } = require('./db/mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcryptjs');

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');

const app = express();
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in production');
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many attempts, please try again later.' },
});

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use((req, _res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

app.use('/api/auth', authLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/posts', commentRoutes);

app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

app.use((_req, res) => res.status(404).json({ error: 'Route not found.' }));
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error.' });
});

async function seed() {
  const alice = await User.findOne({ username: 'alice' });
  if (alice) {
    console.log('✓ Demo data already exists');
    return;
  }

  const password = await bcrypt.hash('demo123', 10);
  const [user1, user2] = await User.create([
    { username: 'alice', email: 'alice@example.com', password },
    { username: 'bob', email: 'bob@example.com', password },
  ]);

  await Post.create([
    {
      title: 'The Future of AI Writing',
      content: 'Artificial intelligence is reshaping how we write and think about content. From automated copywriting to creative assistance, AI tools are becoming indispensable for modern writers.\n\nIn this article, we explore the various ways AI is transforming the writing landscape.',
      category: 'Technology',
      author: user1._id,
      authorName: user1.username,
    },
    {
      title: 'Finding Your Writing Voice',
      content: 'Every writer develops their unique voice over time. It\'s not something you can force, but rather something that emerges naturally through practice and reflection.\n\nHere are some tips to help you discover and nurture your authentic writing voice.',
      category: 'Personal',
      author: user1._id,
      authorName: user1.username,
    },
    {
      title: 'The Art of Storytelling',
      content: 'Stories have been humanity\'s way of preserving knowledge and sharing experiences since the dawn of time. Whether through oral traditions or written word, storytelling remains at the heart of human connection.',
      category: 'Culture',
      author: user2._id,
      authorName: user2.username,
    },
  ]);
  console.log('✓ Seeded demo data');
}

async function start() {
  await connect();
  await seed();
  app.listen(PORT, () => {
    console.log(`\n🚀 Inkwell API running at http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
    console.log(`   Demo credentials: alice / demo123 | bob / demo123\n`);
  });
}

start();