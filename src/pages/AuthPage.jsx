import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { registerUser, loginUser } from '../api/stubs';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

const USTA_RATINGS = ['2.5', '3.0', '3.5', '4.0', '4.5', '5.0', '5.5+'];
const GENDERS = ['Male', 'Female', 'Non-binary / Prefer not to say'];

// ── Register ─────────────────────────────────────────────────────────────────
export function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    ustaRating: '3.5',
    gender: 'Male',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Name and phone number are required.');
      return;
    }
    setLoading(true);
    const result = await registerUser(form);
    if (result.success) {
      // Auto log in
      const loginResult = await loginUser({ phone: form.phone });
      if (loginResult.success) login(loginResult.user);
      navigate(redirect, { replace: true });
    } else {
      setError(result.error || 'Registration failed.');
    }
    setLoading(false);
  }

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-header">
          <span className="auth-logo">🎾</span>
          <h1>Create Your Account</h1>
          <p>Join HittingPartners and start finding hitting sessions.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="auth-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              placeholder="Alex Johnson"
              value={form.name}
              onChange={handleChange}
              required
              maxLength={80}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              Mobile Phone <span className="required">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="form-input"
              placeholder="+1 555 000 1234"
              value={form.phone}
              onChange={handleChange}
              required
            />
            <p className="form-hint">Used to send you SMS notifications.</p>
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email (optional)</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="alex@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="ustaRating" className="form-label">USTA Rating</label>
              <select
                id="ustaRating"
                name="ustaRating"
                className="form-select"
                value={form.ustaRating}
                onChange={handleChange}
              >
                {USTA_RATINGS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="gender" className="form-label">Gender</label>
              <select
                id="gender"
                name="gender"
                className="form-select"
                value={form.gender}
                onChange={handleChange}
              >
                {GENDERS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? <><span className="spinner" /> Creating account…</> : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to={`/login?redirect=${redirect}`}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

// ── Login ─────────────────────────────────────────────────────────────────────
export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!phone.trim()) {
      setError('Please enter your phone number.');
      return;
    }
    setLoading(true);
    const result = await loginUser({ phone });
    if (result.success) {
      login(result.user);
      navigate(redirect, { replace: true });
    } else {
      setError(result.error || 'Login failed.');
    }
    setLoading(false);
  }

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-header">
          <span className="auth-logo">🎾</span>
          <h1>Welcome Back</h1>
          <p>Sign in to manage your hitting requests.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="auth-form">
          <div className="form-group">
            <label htmlFor="phone-login" className="form-label">
              Mobile Phone <span className="required">*</span>
            </label>
            <input
              type="tel"
              id="phone-login"
              className="form-input"
              placeholder="+1 555 000 1234"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setError(''); }}
              required
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? <><span className="spinner" /> Signing in…</> : 'Sign In'}
          </button>
        </form>

        <p className="auth-switch">
          Don&apos;t have an account? <Link to={`/register?redirect=${redirect}`}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
