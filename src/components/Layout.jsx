import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/request', label: 'New Request' },
    { to: '/my-requests', label: 'My Requests' },
  ];

  return (
    <div className="layout">
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="brand">
            <span className="brand-icon">🎾</span>
            <span className="brand-name">HittingPartners</span>
          </Link>

          <nav className="nav">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`nav-link${location.pathname === to ? ' nav-link--active' : ''}`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            {user ? (
              <>
                <span className="user-greeting">Hi, {user.name.split(' ')[0]}</span>
                <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="main">{children}</main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} HittingPartners — Find your next tennis match</p>
      </footer>
    </div>
  );
}
