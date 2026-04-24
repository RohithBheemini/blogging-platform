// data/store.js  —  In-memory database with seed data
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const users = [];
const posts = [];
const comments = [];

const CATEGORIES = [
  'Technology','Science','Culture','Philosophy',
  'Travel','Health','Business','Art','Personal','Other',
];

async function seed() {
  const alice = {
    id: uuidv4(),
    email: 'alice@example.com',
    username: 'alice',
    password: await bcrypt.hash('demo123', 10),
    createdAt: new Date().toISOString(),
  };
  const bob = {
    id: uuidv4(),
    email: 'bob@example.com',
    username: 'bob',
    password: await bcrypt.hash('demo123', 10),
    createdAt: new Date().toISOString(),
  };
  users.push(alice, bob);

  const now = new Date().toISOString();
  const samplePosts = [
    { title: 'The Future of AI Writing', content: 'Artificial intelligence is reshaping how we write and think about content. From automated copywriting to creative assistance, AI tools are becoming indispensable for modern writers.\n\nIn this article, we explore the various ways AI is transforming the writing landscape.', category: 'Technology', authorId: alice.id, authorName: 'alice' },
    { title: 'Finding Your Writing Voice', content: 'Every writer develops their unique voice over time. It\'s not something you can force, but rather something that emerges naturally through practice and reflection.\n\nHere are some tips to help you discover and nurture your authentic writing voice.', category: 'Personal', authorId: alice.id, authorName: 'alice' },
    { title: 'The Art of Storytelling', content: 'Stories have been humanity\'s way of preserving knowledge and sharing experiences since the dawn of time. Whether through oral traditions or written word, storytelling remains at the heart of human connection.', category: 'Culture', authorId: bob.id, authorName: 'bob' },
  ];

  for (const p of samplePosts) {
    const post = { ...p, id: uuidv4(), createdAt: now, updatedAt: now, commentCount: 0 };
    posts.push(post);
  }
}

seed();

module.exports = { users, posts, comments, CATEGORIES, uuidv4 };