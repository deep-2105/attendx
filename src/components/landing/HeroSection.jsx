import DashboardPreview from './DashboardPreview';

export default function HeroSection({ onNavigate }) {
  return (
    <section className="lp-hero-section" id="home">
      <div className="lp-container lp-hero-grid">
        <div className="lp-hero-copy">
          <span className="lp-eyebrow">#1 Smart Attendance Platform</span>
          <h1 className="lp-hero-title">
            Smarter Attendance.
            <br />
            <span>Smarter Decisions.</span>
          </h1>
          <p className="lp-hero-subtitle">
            Track attendance, analyze performance, and improve academic outcomes
            with intelligent insights for students and professors.
          </p>

          <div className="lp-hero-actions">
            <button className="lp-btn lp-btn-primary" onClick={() => onNavigate('role-select')}>Get Started Free</button>
            <button className="lp-btn lp-btn-secondary" onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}>Watch Demo</button>
          </div>

          <ul className="lp-trust-list" aria-label="Platform highlights">
            <li>Real-time Tracking</li>
            <li>Secure &amp; Private</li>
            <li>AI-Powered Insights</li>
          </ul>
        </div>

        <DashboardPreview />
      </div>
    </section>
  );
}
