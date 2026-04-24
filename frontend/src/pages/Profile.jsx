import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyPosts, deletePost } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { formatDate, getErrorMessage } from '../utils';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const toast            = useToast();

  const [posts,    setPosts]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState('posts');
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getMyPosts()
      .then(({ data }) => setPosts(data.posts))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deletePost(deleteId);
      toast.success('Post deleted.');
      setPosts(p => p.filter(x => x.id !== deleteId));
      setDeleteId(null);
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setDeleting(false); }
  };

  return (
    <div style={styles.page}>
      {/* Profile card */}
      <div style={styles.profileCard}>
        <div className="avatar avatar-xl">{user.username[0].toUpperCase()}</div>
        <div style={styles.profileInfo}>
          <h2 style={styles.h2}>{user.username}</h2>
          <p className="text-muted text-sm">{user.email}</p>
          <div style={styles.statRow}>
            <Stat value={posts.length} label="posts" />
            <Stat value={formatDate(user.joinedAt)} label="member since" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {['posts', 'account'].map(t => (
          <button
            key={t}
            style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}
            onClick={() => setTab(t)}
          >
            {t === 'posts' ? 'My Posts' : 'Account'}
          </button>
        ))}
      </div>

      {/* Posts tab */}
      {tab === 'posts' && (
        <div>
          {loading ? (
            <div style={styles.center}><div className="spinner" /></div>
          ) : posts.length === 0 ? (
            <div style={styles.empty}>
              <div style={{ fontSize: '2.5rem', opacity: .4, marginBottom: '1rem' }}>✍️</div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', marginBottom: '.5rem' }}>No posts yet</h3>
              <Link to="/write" className="btn btn-amber" style={{ marginTop: '.5rem' }}>Write Your First Post</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {posts.map(p => (
                <div key={p.id} style={styles.postItem}>
                  <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => navigate(`/posts/${p.id}`)}>
                    <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink)' }}>
                      {p.title}
                    </h4>
                    <div className="mono text-xs text-muted" style={{ marginTop: '4px' }}>
                      {p.category && `${p.category} · `}{formatDate(p.createdAt)} · {p.commentCount ?? 0} 💬
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <Link to={`/write/${p.id}`} className="btn btn-outline btn-sm">Edit</Link>
                    <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(p.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Account tab */}
      {tab === 'account' && (
        <div style={styles.accountCard}>
          <h3 style={styles.accountTitle}>Account Settings</h3>
          <div style={styles.infoGrid}>
            <InfoRow label="Username" value={user.username} />
            <InfoRow label="Email"    value={user.email} />
            <InfoRow label="Joined"   value={formatDate(user.joinedAt)} />
          </div>

          <div style={styles.dangerZone}>
            <div style={{ marginBottom: '1rem' }}>
              <div style={styles.dangerTitle}>Sign Out</div>
              <p className="text-muted text-sm">End your current session.</p>
            </div>
            <button
              className="btn btn-outline"
              onClick={() => { logout(); toast.info('Signed out.'); navigate('/'); }}
            >Sign Out</button>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {deleteId && (
        <div style={styles.overlay} onClick={() => setDeleteId(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', marginBottom: '.75rem' }}>Delete Post?</h3>
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

function Stat({ value, label }) {
  return (
    <div>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '1rem', fontWeight: 500, color: 'var(--ink)' }}>{value}</span>
      {' '}
      <span className="text-muted text-xs">{label}</span>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
      <span className="mono text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</span>
      <span style={{ fontSize: '.9rem', fontWeight: 500 }}>{value}</span>
    </div>
  );
}

const styles = {
  page: { maxWidth: '700px', margin: '0 auto', padding: '3rem 2rem' },
  profileCard: {
    display: 'flex', gap: '1.5rem', alignItems: 'flex-start',
    background: 'var(--white)', border: '1px solid var(--border)',
    borderRadius: '12px', padding: '2rem', marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  profileInfo: { flex: 1 },
  h2: { fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, marginBottom: '.25rem' },
  statRow: { display: 'flex', gap: '1.5rem', marginTop: '.75rem', flexWrap: 'wrap' },
  tabs: {
    display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: '2rem',
  },
  tab: {
    padding: '10px 18px', fontSize: '.875rem', cursor: 'pointer',
    border: 'none', background: 'none', color: 'var(--muted)',
    fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
    borderBottom: '2px solid transparent', marginBottom: '-1px',
    transition: 'all .15s',
  },
  tabActive: { color: 'var(--amber)', borderBottomColor: 'var(--amber)' },
  center: { display: 'grid', placeItems: 'center', padding: '3rem 0' },
  empty: { textAlign: 'center', padding: '3rem 2rem', color: 'var(--muted)' },
  postItem: {
    display: 'flex', gap: '1rem', alignItems: 'center',
    background: 'var(--white)', border: '1px solid var(--border)',
    borderRadius: '10px', padding: '1.25rem 1.5rem',
    animation: 'fadeUp .35s ease',
  },
  accountCard: {
    background: 'var(--white)', border: '1px solid var(--border)',
    borderRadius: '10px', padding: '1.5rem',
  },
  accountTitle: {
    fontFamily: "'Playfair Display', serif", fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem',
  },
  infoGrid: { marginBottom: '2rem' },
  dangerZone: {
    background: '#fdf8f5', border: '1px solid var(--border)',
    borderRadius: '8px', padding: '1.25rem',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    flexWrap: 'wrap', gap: '1rem',
  },
  dangerTitle: { fontWeight: 500, fontSize: '.9rem', marginBottom: '.25rem' },
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
};
