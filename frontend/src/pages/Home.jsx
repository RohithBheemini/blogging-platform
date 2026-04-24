import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAllPosts, getStats } from '../api';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';

const CATEGORIES = [
  'All','Technology','Science','Culture','Philosophy',
  'Travel','Health','Business','Art','Personal','Other',
];

export default function Home() {
  const { user } = useAuth();
  const [posts,      setPosts]      = useState([]);
  const [stats,      setStats]      = useState({});
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [category,   setCategory]   = useState('All');
  const [searchInput,setSearchInput] = useState('');

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 320);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search)           params.search   = search;
      if (category !== 'All') params.category = category;
      const { data } = await getAllPosts(params);
      setPosts(data?.posts ?? []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [search, category]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  useEffect(() => {
    getStats().then(({ data }) => setStats(data ?? {})).catch(() => {});
  }, []);

  return (
    <main>
      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroInner}>
          <p style={styles.eyebrow}>✦ where ideas become stories</p>
          <h1 style={styles.h1}>Read, Write &amp; <em style={{ color: 'var(--amber-light)', fontStyle: 'italic' }}>Inspire</em></h1>
          <p style={styles.heroSub}>A community of writers sharing thoughts, ideas, and stories that matter.</p>
          <div style={styles.heroActions}>
            {user
              ? <Link to="/write" className="btn btn-amber btn-lg">✍ Write a Post</Link>
              : <>
                  <Link to="/register" className="btn btn-amber btn-lg">Join Inkwell</Link>
                  <Link to="/login"    className="btn btn-outline btn-lg" style={{ color: 'var(--paper)', borderColor: 'rgba(245,240,232,.35)' }}>Sign In</Link>
                </>
            }
          </div>
        </div>
      </div>

      {/* Stats bar */}
      {user && (
        <div style={styles.statsBar}>
          <span><strong>{stats.posts ?? 0}</strong> posts</span>
          <span><strong>{stats.users ?? 0}</strong> writers</span>
          <span><strong>{stats.comments ?? 0}</strong> comments</span>
        </div>
      )}

      {/* Feed */}
      <div style={styles.feed}>
        {/* Controls */}
        <div style={styles.feedHeader}>
          <h2 style={styles.feedTitle}>Latest Stories</h2>
          <div style={styles.feedControls}>
            <div style={styles.searchWrap}>
              <span style={styles.searchIcon}>⌕</span>
              <input
                style={styles.searchInput}
                placeholder="Search posts…"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
            </div>
            <span className="mono text-muted text-xs">{posts.length} post{posts.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Category chips */}
        <div style={styles.chips}>
          {CATEGORIES.map(c => (
            <button
              key={c}
              className={`chip ${category === c ? 'active' : ''}`}
              onClick={() => setCategory(c)}
            >{c}</button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={styles.center}><div className="spinner" /></div>
        ) : posts.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>📭</div>
            <h3 style={styles.emptyH}>No posts found</h3>
            <p className="text-muted text-sm" style={{ marginBottom: '1.25rem' }}>
              {search ? 'Try a different search term.' : 'Be the first to write!'}
            </p>
            {user && <Link to="/write" className="btn btn-amber">✍ Write First Post</Link>}
          </div>
        ) : (
          <div style={styles.grid}>
            {posts.map(p => <PostCard key={p.id} post={p} />)}
          </div>
        )}
      </div>
    </main>
  );
}

const styles = {
  hero: {
    background: 'var(--ink)', padding: '4rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden',
    backgroundImage: 'radial-gradient(ellipse at 30% 50%, rgba(200,137,58,.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(200,137,58,.08) 0%, transparent 60%)',
  },
  heroInner: { maxWidth: '680px', margin: '0 auto', position: 'relative' },
  eyebrow: {
    fontFamily: "'DM Mono', monospace", fontSize: '.75rem',
    color: 'var(--amber-light)', letterSpacing: '.15em',
    textTransform: 'uppercase', marginBottom: '1rem',
  },
  h1: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 'clamp(2rem, 5vw, 3.4rem)', fontWeight: 900,
    lineHeight: 1.1, color: 'var(--paper)', marginBottom: '1rem',
  },
  heroSub: { color: 'rgba(245,240,232,.6)', fontSize: '1.05rem', maxWidth: '460px', margin: '0 auto 2rem' },
  heroActions: { display: 'flex', gap: '.75rem', justifyContent: 'center', flexWrap: 'wrap' },
  statsBar: {
    background: 'var(--cream)', borderBottom: '1px solid var(--border)',
    padding: '.7rem 2rem', display: 'flex', gap: '2rem', justifyContent: 'center',
    fontFamily: "'DM Mono', monospace", fontSize: '.78rem', color: 'var(--muted)',
  },
  feed: { maxWidth: '940px', margin: '0 auto', padding: '3rem 2rem' },
  feedHeader: {
    display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
    marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)',
    flexWrap: 'wrap', gap: '1rem',
  },
  feedTitle: { fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 700 },
  feedControls: { display: 'flex', alignItems: 'center', gap: '.75rem' },
  searchWrap: { position: 'relative' },
  searchIcon: {
    position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
    color: 'var(--muted)', pointerEvents: 'none', fontSize: '1rem',
  },
  searchInput: {
    padding: '7px 12px 7px 32px', border: '1.5px solid var(--border)',
    borderRadius: '6px', background: 'var(--white)', fontFamily: "'DM Sans', sans-serif",
    fontSize: '.875rem', outline: 'none', color: 'var(--ink)', width: '220px',
  },
  chips: { display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginBottom: '1.75rem' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
    gap: '1.5rem',
  },
  center: { display: 'grid', placeItems: 'center', padding: '4rem 0' },
  empty: { textAlign: 'center', padding: '4rem 2rem', color: 'var(--muted)' },
  emptyIcon: { fontSize: '2.5rem', opacity: .4, marginBottom: '1rem' },
  emptyH: { fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', color: 'var(--ink)', marginBottom: '.5rem' },
};
