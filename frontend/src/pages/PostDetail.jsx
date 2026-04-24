import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPost, getComments, addComment, deleteComment, deletePost } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { formatDateFull, formatDate, getErrorMessage } from '../utils';

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [post,        setPost]        = useState(null);
  const [comments,    setComments]    = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading,     setLoading]     = useState(true);
  const [commenting,  setCommenting]  = useState(false);
  const [showDelete,  setShowDelete]  = useState(false);
  const [deleting,    setDeleting]    = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([getPost(id), getComments(id)])
      .then(([{ data: pd }, { data: cd }]) => {
        setPost(pd?.post);
        setComments(cd?.comments ?? []);
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id]);

  const fetchComments = () =>
    getComments(id).then(({ data }) => setComments(data?.comments ?? []));

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommenting(true);
    try {
      await addComment(id, { content: commentText });
      setCommentText('');
      toast.success('Comment posted!');
      fetchComments();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setCommenting(false); }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(id, commentId);
      toast.success('Comment deleted.');
      fetchComments();
    } catch { toast.error('Could not delete comment.'); }
  };

  const handleDeletePost = async () => {
    setDeleting(true);
    try {
      await deletePost(id);
      toast.success('Post deleted.');
      navigate('/');
    } catch { toast.error('Could not delete post.'); setDeleting(false); }
  };

  if (loading) return <div style={center}><div className="spinner" /></div>;
  if (!post)   return null;

  const isOwn = user && (user.id === post.author?.toString() || user.id === post.authorId);

  return (
    <div style={styles.page}>
      {/* Back link */}
      <button onClick={() => navigate(-1)} style={styles.back}>← Back</button>

      {/* Article header */}
      <article>
        {post.category && <div style={styles.category}>{post.category}</div>}
        <h1 style={styles.title}>{post.title}</h1>

        <div style={styles.byline}>
          <div className="avatar avatar-md">{post.authorName[0].toUpperCase()}</div>
          <div>
            <div style={{ fontWeight: 500 }}>@{post.authorName}</div>
            <div className="mono text-xs text-muted">
              {formatDateFull(post.createdAt)}
              {post.updatedAt && ` · edited ${formatDate(post.updatedAt)}`}
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={styles.body}>
          {post.content.split('\n').filter(l => l.trim()).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        {/* Owner actions */}
        {isOwn && (
          <div style={styles.actions}>
            <Link to={`/write/${post.id}`} className="btn btn-outline btn-sm">✏ Edit</Link>
            <button className="btn btn-danger btn-sm" onClick={() => setShowDelete(true)}>🗑 Delete</button>
          </div>
        )}
      </article>

      {/* Comments */}
      <section style={styles.comments}>
        <h3 style={styles.commentsTitle}>Comments ({comments.length})</h3>

        {/* Comment form */}
        {user ? (
          <form onSubmit={handleComment} style={styles.commentForm}>
            <div className="avatar avatar-sm">{user.username[0].toUpperCase()}</div>
            <div style={{ flex: 1 }}>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Add a comment…"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                style={{ minHeight: '80px', fontSize: '.9rem' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button className="btn btn-primary btn-sm" type="submit" disabled={commenting || !commentText.trim()}>
                  {commenting ? 'Posting…' : 'Post Comment'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div style={styles.loginPrompt}>
            <Link to="/login" style={{ color: 'var(--amber)', fontWeight: 500 }}>Sign in</Link> to leave a comment
          </div>
        )}

        {/* Comment list */}
        {comments.length === 0 ? (
          <p className="text-muted text-sm" style={{ textAlign: 'center', padding: '2rem 0' }}>
            No comments yet. Be the first!
          </p>
        ) : (
          <div style={styles.commentList}>
            {comments.map(c => (
              <div key={c.id} style={styles.comment}>
                <div className="avatar avatar-sm">{(c.authorName || c.username)[0].toUpperCase()}</div>
                <div style={styles.commentBody}>
                  <div style={styles.commentMeta}>
                    <span style={{ fontWeight: 500, fontSize: '.875rem' }}>@{c.authorName || c.username}</span>
                    <span className="mono text-xs text-muted">{formatDate(c.createdAt)}</span>
                    {user && user.id === c.author && (
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '2px 6px', marginLeft: 'auto', fontSize: '.72rem', color: 'var(--danger)' }}
                        onClick={() => handleDeleteComment(c.id)}
                      >Delete</button>
                    )}
                  </div>
                  <p style={{ fontSize: '.9rem', color: '#3a3830' }}>{c.content || c.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Delete modal */}
      {showDelete && (
        <div style={styles.overlay} onClick={() => setShowDelete(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Delete Post?</h3>
            <p className="text-muted text-sm" style={{ marginBottom: '1.5rem' }}>
              This action cannot be undone. The post and all comments will be permanently removed.
            </p>
            <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setShowDelete(false)}>Cancel</button>
              <button
                className="btn btn-primary"
                style={{ background: 'var(--danger)' }}
                onClick={handleDeletePost}
                disabled={deleting}
              >{deleting ? 'Deleting…' : 'Yes, Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const center = { display: 'grid', placeItems: 'center', minHeight: '60vh' };

const styles = {
  page: { maxWidth: '720px', margin: '0 auto', padding: '3rem 2rem' },
  back: {
    background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0',
    color: 'var(--muted)', fontSize: '.875rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '6px',
  },
  category: {
    fontFamily: "'DM Mono', monospace", fontSize: '.75rem',
    color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: '.75rem',
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 900, lineHeight: 1.15, marginBottom: '1.5rem',
  },
  byline: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '1rem 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
    marginBottom: '2rem',
  },
  body: {
    fontSize: '1.05rem', lineHeight: 1.82, color: '#2a2820', marginBottom: '2rem',
  },
  actions: {
    display: 'flex', gap: '.75rem',
    padding: '1.25rem 0', borderTop: '1px solid var(--border)', marginBottom: '1rem',
  },
  comments: { marginTop: '1.5rem', borderTop: '2px solid var(--border)', paddingTop: '2rem' },
  commentsTitle: {
    fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem',
  },
  commentForm: { display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '2rem' },
  loginPrompt: {
    background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '8px',
    padding: '1rem', textAlign: 'center', fontSize: '.875rem', color: 'var(--muted)',
    marginBottom: '2rem',
  },
  commentList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  comment: { display: 'flex', gap: '12px' },
  commentBody: {
    flex: 1, background: 'var(--white)', border: '1px solid var(--border)',
    borderRadius: '8px', padding: '.875rem 1rem',
  },
  commentMeta: {
    display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '.4rem',
  },
  overlay: {
    position: 'fixed', inset: 0, zIndex: 500,
    background: 'rgba(15,14,12,.55)', backdropFilter: 'blur(4px)',
    display: 'grid', placeItems: 'center', padding: '2rem',
  },
  modal: {
    background: 'var(--white)', borderRadius: '12px', padding: '2rem',
    maxWidth: '400px', width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,.3)',
    animation: 'fadeUp .25s ease',
  },
  modalTitle: { fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', marginBottom: '.75rem' },
};
