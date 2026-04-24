// src/components/Navbar.jsx
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const handleLogout = () => {
    logout();
    toast.info('You have been signed out.');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>
        Ink<span style={{ color: 'var(--amber)' }}>well</span>
      </Link>

      <div style={styles.right}>
        {user ? (
          <>
            <span style={styles.username}>@{user.username}</span>
            <NavLink to="/" active={isActive('/')}>Feed</NavLink>
            <NavLink to="/my-posts" active={isActive('/my-posts')}>My Posts</NavLink>
            <NavLink to="/profile" active={isActive('/profile')}>Profile</NavLink>
            <Link to="/write" className="btn btn-amber btn-sm">✍ Write</Link>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login"    className="btn btn-ghost btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

function NavLink({ to, children, active }) {
  return (
    <Link
      to={to}
      style={{
        ...styles.navLink,
        color: active ? 'var(--amber)' : 'var(--muted)',
        fontWeight: active ? 500 : 400,
      }}
    >
      {children}
    </Link>
  );
}

const styles = {
  nav: {
    position: 'sticky', top: 0, zIndex: 100,
    background: 'rgba(245,240,232,.92)', backdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--border)',
    padding: '0 2rem', height: '64px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  brand: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.55rem', fontWeight: 900, color: 'var(--ink)',
    letterSpacing: '-0.02em',
  },
  right: {
    display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap',
  },
  username: {
    fontFamily: "'DM Mono', monospace", fontSize: '0.78rem',
    color: 'var(--muted)', marginRight: '0.25rem',
  },
  navLink: {
    fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem',
    padding: '6px 10px', borderRadius: '6px', transition: 'var(--transition)',
  },
};
