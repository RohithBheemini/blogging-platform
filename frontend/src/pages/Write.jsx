import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPost, updatePost, getPost } from '../api';
import { useToast } from '../components/Toast';
import { getErrorMessage } from '../utils';

const CATEGORIES = [
  'Technology','Science','Culture','Philosophy',
  'Travel','Health','Business','Art','Personal','Other',
];

export default function Write() {
  const { id } = useParams();           // defined when editing
  const isEdit  = Boolean(id);
  const navigate = useNavigate();
  const toast    = useToast();

  const [form, setForm]       = useState({ title: '', content: '', category: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  // Load existing post when editing
  useEffect(() => {
    if (!isEdit) return;
    setFetching(true);
    getPost(id)
      .then(({ data }) => {
        const { title, content, category } = data.post;
        setForm({ title, content, category: category || '' });
      })
      .catch(() => { toast.error('Post not found.'); navigate('/'); })
      .finally(() => setFetching(false));
  }, [id, isEdit]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!form.content.trim()) { setError('Content is required.'); return; }
    if (form.content.trim().length < 50) { setError('Content must be at least 50 characters.'); return; }

    setError(''); setLoading(true);
    try {
      if (isEdit) {
        await updatePost(id, form);
        toast.success('Post updated!');
        navigate(`/posts/${id}`);
      } else {
        const { data } = await createPost(form);
        const postId = data?.post?.id || data?.id;
        if (!postId) {
          console.error('Create post response:', data);
          throw new Error('Failed to get post ID');
        }
        toast.success('Post published!');
        navigate(`/posts/${postId}`);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally { setLoading(false); }
  };

  if (fetching) return (
    <div style={styles.center}><div className="spinner" /></div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.h2}>{isEdit ? 'Edit Post' : 'Write a New Post'}</h2>
        <p className="text-muted text-sm">{isEdit ? 'Update your story' : 'Share your thoughts with the world'}</p>
      </div>

      <form style={styles.form} onSubmit={handleSubmit}>
        {/* Title */}
        <div className="form-group">
          <label className="form-label">Post Title</label>
          <input
            className="form-input"
            type="text"
            placeholder="An interesting title…"
            value={form.title}
            onChange={set('title')}
            maxLength={150}
            style={{ fontSize: '1.05rem' }}
          />
          <div style={styles.charRow}>
            <span className="form-hint">Make it count.</span>
            <span className="mono text-xs text-muted">{form.title.length}/150</span>
          </div>
        </div>

        {/* Category */}
        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-select" value={form.category} onChange={set('category')}>
            <option value="">Select a category</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Content */}
        <div className="form-group">
          <label className="form-label">Content</label>
          <textarea
            className="form-textarea"
            rows={16}
            placeholder="Tell your story…"
            value={form.content}
            onChange={set('content')}
            maxLength={10000}
            style={{ minHeight: '320px', fontSize: '1rem', lineHeight: 1.75 }}
          />
          <div style={styles.charRow}>
            <span className="form-hint">Minimum 50 characters · max 10,000.</span>
            <span className="mono text-xs" style={{ color: form.content.length > 9500 ? 'var(--danger)' : 'var(--muted)' }}>
              {form.content.length}/10,000
            </span>
          </div>
        </div>

        {error && <p className="form-error" style={{ marginBottom: '1rem' }}>{error}</p>}

        <div style={styles.actions}>
          <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-amber" disabled={loading}>
            {loading
              ? <><span className="spinner" style={{ width: 16, height: 16 }} /> {isEdit ? 'Updating…' : 'Publishing…'}</>
              : isEdit ? 'Update Post' : 'Publish Post'
            }
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  page: { maxWidth: '760px', margin: '0 auto', padding: '3rem 2rem' },
  header: { marginBottom: '2.25rem' },
  h2: { fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 700 },
  form: { display: 'flex', flexDirection: 'column', gap: '.25rem' },
  charRow: { display: 'flex', justifyContent: 'space-between', marginTop: '4px' },
  actions: { display: 'flex', gap: '.75rem', justifyContent: 'flex-end', marginTop: '.5rem' },
  center: { display: 'grid', placeItems: 'center', minHeight: '60vh' },
};
