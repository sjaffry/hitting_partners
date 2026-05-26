import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './HomePage.css';

const FEATURES = [
  {
    icon: '📅',
    title: 'Pick Your Time',
    desc: 'Choose any date and time that works for your schedule.',
  },
  {
    icon: '⭐',
    title: 'Select Your Level',
    desc: 'Filter by USTA rating so you always play a competitive match.',
  },
  {
    icon: '📲',
    title: 'Instant SMS Alerts',
    desc: 'All registered players get an SMS — the first to accept gets the slot.',
  },
  {
    icon: '✅',
    title: 'Member Accepts',
    desc: 'Both players receive confirmation and court details right away.',
  },
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="hero-accent">Find a Foothills Hitting Partner</span>
          </h1>
          <p className="hero-subtitle">
            Post a hitting request and HittingPartner will connect
            you with a member with a similar skill level.
          </p>
          <div className="hero-cta">
            {user ? (
              <Link to="/request" className="btn btn-primary btn-lg">
                🎾 Create Hitting Request
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Get Started — It&apos;s Free
                </Link>
                <Link to="/login" className="btn btn-outline btn-lg">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="court-graphic">
            <div className="court-lines">
              <div className="court-center" />
              <div className="court-service-left" />
              <div className="court-service-right" />
            </div>
            <span className="ball">🎾</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <h2 className="section-title">How it Works</h2>
        <div className="features-grid">
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title} className="feature-card">
              <div className="feature-icon">{icon}</div>
              <h3 className="feature-title">{title}</h3>
              <p className="feature-desc">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      {!user && (
        <section className="cta-banner">
          <h2>Ready to rally?</h2>
          <p>Join the community and never miss a hitting session again.</p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Create a Free Account
          </Link>
        </section>
      )}
    </div>
  );
}
