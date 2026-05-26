import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createHittingRequest } from '../api/stubs';
import './RequestPage.css';

const USTA_RATINGS = ['Any', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0', '5.5+'];
const GENDER_PREFS = ['Any', 'Male', 'Female'];

function getTomorrowDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function getMinDate() {
  return new Date().toISOString().split('T')[0];
}

export default function RequestPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    date: getTomorrowDate(),
    time: '08:00',
    court: '',
    ustaRatingPref: 'Any',
    genderPref: 'Any',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    return (
      <div className="auth-prompt">
        <div className="auth-prompt-card card">
          <span className="auth-prompt-icon">🔒</span>
          <h2>Sign in Required</h2>
          <p>You must be signed in to create a hitting request.</p>
          <div className="auth-prompt-actions">
            <a href="/login" className="btn btn-primary">Sign In</a>
            <a href="/register" className="btn btn-outline">Create Account</a>
          </div>
        </div>
      </div>
    );
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Basic validation
    const selectedDateTime = new Date(`${form.date}T${form.time}`);
    if (selectedDateTime < new Date()) {
      setError('Please select a future date and time.');
      return;
    }

    setLoading(true);
    try {
      const result = await createHittingRequest({
        requesterId: user.id,
        requesterName: user.name,
        requesterPhone: user.phone,
        requesterUstaRating: user.ustaRating,
        ...form,
      });

      if (result.success) {
        navigate(`/my-requests?created=${result.requestId}`);
      } else {
        setError(result.error || 'Failed to create request. Please try again.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="request-page">
      <div className="page-header">
        <h1>Create Hitting Request</h1>
        <p className="page-subtitle">
          Fill in your preferred details — we&apos;ll SMS all registered players and
          the first to respond gets the slot.
        </p>
      </div>

      <form className="request-form card" onSubmit={handleSubmit} noValidate>
        {/* Date + Time row */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date" className="form-label">
              Date <span className="required">*</span>
            </label>
            <input
              type="date"
              id="date"
              name="date"
              className="form-input"
              value={form.date}
              min={getMinDate()}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="time" className="form-label">
              Time <span className="required">*</span>
            </label>
            <input
              type="time"
              id="time"
              name="time"
              className="form-input"
              value={form.time}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Court / Location */}
        <div className="form-group">
          <label htmlFor="court" className="form-label">
            Court number
          </label>
          <input
            type="text"
            id="court"
            name="court"
            className="form-input"
            placeholder="e.g. Court 3"
            value={form.court}
            onChange={handleChange}
            maxLength={120}
          />
        </div>

        {/* USTA Rating + Gender row */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="ustaRatingPref" className="form-label">
              Preferred Opponent USTA Rating
            </label>
            <select
              id="ustaRatingPref"
              name="ustaRatingPref"
              className="form-select"
              value={form.ustaRatingPref}
              onChange={handleChange}
            >
              {USTA_RATINGS.map((r) => (
                <option key={r} value={r}>{r === 'Any' ? 'Any Rating' : r}</option>
              ))}
            </select>
            <p className="form-hint">Your rating: <strong>{user.ustaRating}</strong></p>
          </div>

          <div className="form-group">
            <label htmlFor="genderPref" className="form-label">
              Preferred Opponent Gender
            </label>
            <select
              id="genderPref"
              name="genderPref"
              className="form-select"
              value={form.genderPref}
              onChange={handleChange}
            >
              {GENDER_PREFS.map((g) => (
                <option key={g} value={g}>{g === 'Any' ? 'No Preference' : g}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div className="form-group">
          <label htmlFor="notes" className="form-label">Additional Notes</label>
          <textarea
            id="notes"
            name="notes"
            className="form-textarea"
            rows={3}
            placeholder="e.g. Bring your own balls. Looking for singles play."
            value={form.notes}
            onChange={handleChange}
            maxLength={300}
          />
          <p className="form-hint char-count">{form.notes.length}/300</p>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? (
              <><span className="spinner" /> Sending SMS…</>
            ) : (
              'Send Request'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
