import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getUserRequests, cancelHittingRequest } from '../api/stubs';
import { useAuth } from '../context/AuthContext';
import './MyRequestsPage.css';

function statusLabel(status) {
  switch (status) {
    case 'open': return { label: 'Open', cls: 'badge--open' };
    case 'accepted': return { label: 'Accepted', cls: 'badge--accepted' };
    case 'cancelled': return { label: 'Cancelled', cls: 'badge--cancelled' };
    default: return { label: status, cls: '' };
  }
}

function formatDateTime(date, time) {
  if (!date) return '—';
  const dt = new Date(`${date}T${time || '00:00'}`);
  return dt.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MyRequestsPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const justCreated = searchParams.get('created');

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (!user) return;
    async function fetch() {
      const result = await getUserRequests(user.id);
      if (result.success) {
        // Most recent first
        setRequests([...result.requests].reverse());
      }
      setLoading(false);
    }
    fetch();
  }, [user]);

  async function handleCancel(requestId) {
    if (!window.confirm('Cancel this hitting request?')) return;
    setCancellingId(requestId);
    const result = await cancelHittingRequest(requestId);
    if (result.success) {
      setRequests((prev) =>
        prev.map((r) => r.id === requestId ? { ...r, status: 'cancelled' } : r)
      );
    }
    setCancellingId(null);
  }

  if (!user) {
    return (
      <div className="auth-prompt">
        <div className="auth-prompt-card card">
          <span className="auth-prompt-icon">🔒</span>
          <h2>Sign in Required</h2>
          <p>You must be signed in to view your requests.</p>
          <div className="auth-prompt-actions">
            <Link to="/login" className="btn btn-primary">Sign In</Link>
            <Link to="/register" className="btn btn-outline">Create Account</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-requests-page">
      <div className="page-header">
        <h1>My Hitting Requests</h1>
        <Link to="/request" className="btn btn-primary">
          + New Request
        </Link>
      </div>

      {justCreated && (
        <div className="banner-success">
          🎉 Your request was created and SMS notifications have been sent to all registered players!
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Loading your requests…</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🎾</span>
          <h2>No Requests Yet</h2>
          <p>Create your first hitting request and find a partner!</p>
          <Link to="/request" className="btn btn-primary">Create Request</Link>
        </div>
      ) : (
        <div className="requests-list">
          {requests.map((req) => {
            const { label, cls } = statusLabel(req.status);
            return (
              <div key={req.id} className="request-card card">
                <div className="rc-header">
                  <div>
                    <p className="rc-datetime">{formatDateTime(req.date, req.time)}</p>
                    {req.court && <p className="rc-court">📍 {req.court}</p>}
                  </div>
                  <span className={`badge ${cls}`}>{label}</span>
                </div>

                <div className="rc-prefs">
                  <span className="pref-chip">⭐ {req.ustaRatingPref === 'Any' ? 'Any Rating' : `USTA ${req.ustaRatingPref}`}</span>
                  <span className="pref-chip">👤 {req.genderPref === 'Any' ? 'Any Gender' : req.genderPref}</span>
                </div>

                {req.status === 'accepted' && req.acceptedByName && (
                  <p className="rc-accepted-by">
                    ✅ Accepted by <strong>{req.acceptedByName}</strong>
                  </p>
                )}

                {req.notes && <p className="rc-notes">{req.notes}</p>}

                <div className="rc-actions">
                  <Link to={`/accept/${req.id}`} className="btn btn-ghost btn-sm">
                    View / Share
                  </Link>
                  {req.status === 'open' && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleCancel(req.id)}
                      disabled={cancellingId === req.id}
                    >
                      {cancellingId === req.id ? 'Cancelling…' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
