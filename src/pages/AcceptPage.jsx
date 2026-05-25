import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getHittingRequest, acceptHittingRequest } from '../api/stubs';
import { useAuth } from '../context/AuthContext';
import './AcceptPage.css';

function formatDateTime(date, time) {
  if (!date) return '—';
  const dt = new Date(`${date}T${time || '00:00'}`);
  return dt.toLocaleString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AcceptPage() {
  const { requestId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [success, setSuccess] = useState('');
  const [acceptError, setAcceptError] = useState('');

  useEffect(() => {
    async function fetchRequest() {
      setLoading(true);
      const result = await getHittingRequest(requestId);
      if (result.success) {
        setRequest(result.request);
      } else {
        setLoadError(result.error || 'Could not load this request.');
      }
      setLoading(false);
    }
    if (requestId) fetchRequest();
  }, [requestId]);

  async function handleAccept() {
    if (!user) {
      // Redirect to login, preserving the deep link
      navigate(`/login?redirect=/accept/${requestId}`);
      return;
    }

    setAccepting(true);
    setAcceptError('');
    const result = await acceptHittingRequest({
      requestId,
      responderId: user.id,
      responderName: user.name,
    });
    if (result.success) {
      setSuccess(result.message);
      // Refresh request data
      const updated = await getHittingRequest(requestId);
      if (updated.success) setRequest(updated.request);
    } else {
      setAcceptError(result.error || 'Could not accept this request.');
    }
    setAccepting(false);
  }

  if (loading) {
    return (
      <div className="accept-loading">
        <div className="loading-spinner" />
        <p>Loading request details…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="accept-error-state">
        <span className="error-icon">⚠️</span>
        <h2>Request Not Found</h2>
        <p>{loadError}</p>
        <button className="btn btn-outline" onClick={() => navigate('/')}>
          Go Home
        </button>
      </div>
    );
  }

  const isOwner = user && user.id === request.requesterId;
  const isOpen = request.status === 'open';
  const isAccepted = request.status === 'accepted';
  const isCancelled = request.status === 'cancelled';

  return (
    <div className="accept-page">
      <div className="accept-card card">
        {/* Status badge */}
        <div className={`status-badge status-badge--${request.status}`}>
          {isOpen && '🟢 Open — Accepting Players'}
          {isAccepted && '✅ Slot Taken'}
          {isCancelled && '❌ Cancelled'}
        </div>

        <h1 className="accept-title">Hitting Request</h1>
        <p className="accept-requester">
          Posted by <strong>{request.requesterName}</strong>
          {request.requesterUstaRating && ` (USTA ${request.requesterUstaRating})`}
        </p>

        {/* Details grid */}
        <div className="details-grid">
          <DetailRow icon="📅" label="Date & Time" value={formatDateTime(request.date, request.time)} />
          {request.court && <DetailRow icon="📍" label="Location" value={request.court} />}
          <DetailRow
            icon="⭐"
            label="Preferred Opponent Rating"
            value={request.ustaRatingPref === 'Any' ? 'Any USTA Rating' : `USTA ${request.ustaRatingPref}`}
          />
          <DetailRow
            icon="👤"
            label="Preferred Gender"
            value={request.genderPref === 'Any' ? 'No Preference' : request.genderPref}
          />
          {request.notes && <DetailRow icon="📝" label="Notes" value={request.notes} />}
        </div>

        {/* Accepted-by info */}
        {isAccepted && (
          <div className="accepted-info">
            <strong>Accepted by:</strong> {request.acceptedByName || 'Another player'}
          </div>
        )}

        {/* Success / error feedback */}
        {success && (
          <div className="accept-success">
            <span>🎉</span> {success}
          </div>
        )}
        {acceptError && (
          <div className="accept-error-msg">{acceptError}</div>
        )}

        {/* Actions */}
        <div className="accept-actions">
          {isOpen && !isOwner && !success && (
            <>
              {!user && (
                <p className="signin-nudge">
                  <a href={`/login?redirect=/accept/${requestId}`}>Sign in</a> or{' '}
                  <a href={`/register?redirect=/accept/${requestId}`}>create an account</a> to accept this request.
                </p>
              )}
              <button
                className="btn btn-primary btn-lg"
                onClick={handleAccept}
                disabled={accepting || !user}
              >
                {accepting ? (
                  <><span className="spinner" /> Accepting…</>
                ) : (
                  '🎾 Accept this Request'
                )}
              </button>
            </>
          )}

          {isOwner && isOpen && (
            <p className="owner-note">This is your request. Share the link below with friends or wait for someone to respond via SMS.</p>
          )}

          {(isAccepted || isCancelled) && !success && (
            <button className="btn btn-outline" onClick={() => navigate('/')}>
              Back to Home
            </button>
          )}
        </div>

        {/* Share link */}
        {isOpen && (
          <div className="share-section">
            <p className="share-label">Share this link:</p>
            <div className="share-link-box">
              <code className="share-link">{window.location.href}</code>
              <button
                className="btn btn-ghost btn-sm copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                }}
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="detail-row">
      <span className="detail-icon">{icon}</span>
      <div className="detail-content">
        <span className="detail-label">{label}</span>
        <span className="detail-value">{value}</span>
      </div>
    </div>
  );
}
