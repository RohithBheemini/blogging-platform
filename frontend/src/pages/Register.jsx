import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { getErrorMessage } from '../utils';

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form,    setForm]    = useState({ username: '', email: '', password: '', confirm: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) { setError('All fields are required.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    setError(''); setLoading(true);
    try {
      const user = await register({ username: form.username, email: form.email, password: form.password });
      toast.success(`🎉 Welcome to Inkwell, ${user.username}!`);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card} className="fade-up">
        <div style={styles.header}>
          <h2 style={styles.h2}>Create Account</h2>
          <p className="text-muted text-sm">Join thousands of writers on Inkwell</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              className="form-input"
              type="text"
              placeholder="yourname"
              value={form.username}
              onChange={set('username')}
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={set('password')}
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Repeat password"
              value={form.confirm}
              onChange={set('confirm')}
              autoComplete="new-password"
            />
          </div>

          {error && <p className="form-error" style={{ marginBottom: '1rem' }}>{error}</p>}

          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Creating account…</> : 'Create Account'}
          </button>
        </form>

        <div className="divider">already have an account?</div>
        <Link to="/login" className="btn btn-outline btn-full" style={{ justifyContent: 'center' }}>
          Sign In
        </Link>
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
};
