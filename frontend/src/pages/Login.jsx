import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { getErrorMessage } from '../utils';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form,    setForm]    = useState({ identifier: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.identifier || !form.password) { setError('All fields are required.'); return; }
    setError(''); setLoading(true);
    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.username}!`);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card} className="fade-up">
        <div style={styles.header}>
          <h2 style={styles.h2}>Welcome Back</h2>
          <p className="text-muted text-sm">Sign in to continue writing</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username or Email</label>
            <input
              className="form-input"
              type="text"
              placeholder="username or email"
              value={form.identifier}
              onChange={set('identifier')}
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={set('password')}
              autoComplete="current-password"
            />
          </div>

          {error && <p className="form-error" style={{ marginBottom: '1rem' }}>{error}</p>}

          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Signing in…</> : 'Sign In'}
          </button>
        </form>

        <div className="divider">new here?</div>
        <Link to="/register" className="btn btn-outline btn-full" style={{ justifyContent: 'center' }}>
          Create Account
        </Link>

        <p style={styles.demo}>
          Demo: <code>alice</code> or <code>bob</code> — password <code>demo123</code>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: 'calc(100vh - 64px)', display: 'grid', placeItems: 'center',
    padding: '2rem',
    background: 'linear-gradient(135deg, var(--paper) 60%, var(--cream) 100%)',
  },
  card: {
    background: 'var(--white)', border: '1px solid var(--border)',
    borderRadius: '12px', padding: '2.5rem',
    width: '100%', maxWidth: '420px',
    boxShadow: '0 4px 24px rgba(15,14,12,.09)',
  },
  header: { textAlign: 'center', marginBottom: '2rem' },
  h2: { fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 700, marginBottom: '.4rem' },
  demo: {
    marginTop: '1.25rem', textAlign: 'center',
    fontSize: '.78rem', color: 'var(--muted)',
  },
};
