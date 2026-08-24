
export default function FinalCtaSection({ onNavigate }) {
  return (
    <section className="lp-final-cta">
      <div className="lp-container">
        <h2>
          Your attendance. Your decisions. Your advantage.
        </h2>
        <p>Join thousands of students and professors who trust AttendX.</p>
        <button className="lp-btn lp-btn-primary" onClick={() => onNavigate('role-select')}>Get Started Free</button>
      </div>
    </section>
  );
}
