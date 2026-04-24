// src/components/PostCard.jsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils';

export default function PostCard({ post }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isOwn = user && user.id === post.authorId;

  const excerpt = post.content.replace(/\n/g, ' ').substring(0, 150);
  const hasMore = post.content.length > 150;

  return (
    <article style={styles.card} onClick={() => navigate(`/posts/${post.id}`)}>
      {isOwn && <span className="badge badge-amber" style={styles.badge}>Mine</span>}

      {post.category && (
        <div style={styles.category}>{post.category}</div>
      )}

      <h3 style={styles.title}>{post.title}</h3>
      <p style={styles.excerpt}>{excerpt}{hasMore ? '…' : ''}</p>

      <div style={styles.meta}>
        <div style={styles.author}>
          <div className="avatar avatar-sm">{post.authorName[0].toUpperCase()}</div>
          <span>@{post.authorName}</span>
        </div>
        <span style={{ color: 'var(--muted)', fontSize: '.72rem', fontFamily: 'DM Mono, monospace' }}>
          {formatDate(post.createdAt)} · {post.commentCount ?? 0} 💬
        </span>
      </div>
    </article>
  );
}

const styles = {
  card: {
    position: 'relative',
    background: 'var(--white)', border: '1px solid var(--border)',
    borderRadius: '10px', padding: '1.5rem', cursor: 'pointer',
    transition: 'transform .2s, box-shadow .2s, border-color .2s',
    animation: 'fadeUp .35s ease',
  },
  badge: {
    position: 'absolute', top: '12px', right: '12px',
  },
  category: {
    fontFamily: "'DM Mono', monospace", fontSize: '.7rem',
    color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '.1em',
    marginBottom: '.6rem',
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.3,
    color: 'var(--ink)', marginBottom: '.6rem',
  },
  excerpt: {
    fontSize: '.875rem', color: 'var(--muted)', lineHeight: 1.55,
    marginBottom: '1rem',
    display: '-webkit-box', WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical', overflow: 'hidden',
  },
  meta: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    borderTop: '1px solid var(--border)', paddingTop: '.75rem',
    fontFamily: "'DM Mono', monospace", fontSize: '.72rem', color: 'var(--muted)',
  },
  author: { display: 'flex', alignItems: 'center', gap: '6px' },
};
