import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyPosts, deletePost } from '../api';
import { useToast } from '../components/Toast';
import { formatDate, getErrorMessage } from '../utils';

export default function MyPosts() {
  const navigate = useNavigate();
  const toast    = useToast();

  const [posts,      setPosts]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [deleteId,   setDeleteId]   = useState(null);
  const [deleting,   setDeleting]   = useState(false);

  const load = () => {
    setLoading(true);
    getMyPosts()
      .then(({ data }) => setPosts(data?.posts ?? []))
      .catch(() => toast.error('Could not load posts.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deletePost(deleteId);
      toast.success('Post deleted.');
      setDeleteId(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally { setDeleting(false); }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.h2}>My Posts</h2>
          <p className="text-muted text-sm">{posts.length} post{posts.length !== 1 ? 's' : ''} published</p>
        </div>
        <Link to="/write" className="btn btn-amber">✍ Write New Post</Link>
      </div>

      {loading ? (
        <div style={styles.center}><div className="spinner" /></div>
      ) : posts.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>✍️</div>
          <h3 style={styles.emptyH}>No posts yet</h3>
          <p className="text-muted text-sm" style={{ marginBottom: '1.25rem' }}>Your writing journey starts with a single post.</p>
          <Link to="/write" className="btn btn-amber">Write Your First Post</Link>
        </div>
      ) : (
        <div style={styles.list}>
          {posts.map(p => (
            <div key={p.id} style={styles.item} className="fade-up">
              <div style={styles.itemContent} onClick={() => navigate(`/posts/${p.id}`)}>
                <h3 style={styles.itemTitle}>{p.title}</h3>
                <div className="mono text-xs text-muted" style={{ marginTop: '4px' }}>
                  {p.category && `${p.category} · `}
                  {formatDate(p.createdAt)} · {p.commentCount ?? 0} comment{p.commentCount !== 1 ? 's' : ''}
                </div>
              </div>
              <div style={styles.itemActions}>
                <Link to={`/write/${p.id}`} className="btn btn-outline btn-sm">Edit</Link>
                <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(p.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteId && (
        <div style={styles.overlay} onClick={() => setDeleteId(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Delete Post?</h3>
            <p className="text-muted text-sm" style={{ marginBottom: '1.5rem' }}>
              This will permanently remove the post and all its comments.
            </p>
            <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setDeleteId(null)}>Cancel</button>
              <button
                className="btn btn-primary"
                style={{ background: 'var(--danger)' }}
                onClick={handleDelete}
                disabled={deleting}
              >{deleting ? 'Deleting…' : 'Yes, Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem' },
  header: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem',
  },
  h2: { fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 700 },
  center: { display: 'grid', placeItems: 'center', padding: '4rem 0' },
  empty: { textAlign: 'center', padding: '4rem 2rem', color: 'var(--muted)' },
  emptyIcon: { fontSize: '2.5rem', marginBottom: '1rem', opacity: .4 },
  emptyH: { fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', color: 'var(--ink)', marginBottom: '.5rem' },
  list: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  item: {
    display: 'flex', gap: '1rem', alignItems: 'center',
    background: 'var(--white)', border: '1px solid var(--border)',
    borderRadius: '10px', padding: '1.25rem 1.5rem',
    transition: 'box-shadow .2s',
  },
  itemContent: { flex: 1, cursor: 'pointer' },
  itemTitle: {
    fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)',
  },
  itemActions: { display: 'flex', gap: '6px', flexShrink: 0 },
  overlay: {
    position: 'fixed', inset: 0, zIndex: 500,
    background: 'rgba(15,14,12,.55)', backdropFilter: 'blur(4px)',
    display: 'grid', placeItems: 'center', padding: '2rem',
  },
  modal: {
    background: 'var(--white)', borderRadius: '12px', padding: '2rem',
    maxWidth: '400px', width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,.3)', animation: 'fadeUp .25s ease',
  },
  modalTitle: { fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', marginBottom: '.75rem' },
};
