
const CARDS = [
  {
    title: 'Real-time Tracking',
    desc: 'Mark and track attendance in real-time with instant updates.',
    tone: 'violet',
  },
  {
    title: 'Intelligent Analytics',
    desc: 'Get AI-powered insights and detailed analytics to visualize trends and improve outcomes.',
    tone: 'blue',
  },
  {
    title: 'Secure & Private',
    desc: 'Enterprise-grade security with role-based access and your data always protected.',
    tone: 'green',
  },
  {
    title: 'Easy to Use',
    desc: 'Simple, intuitive interface designed for students and professors.',
    tone: 'pink',
  },
];

export default function WhyAttendX() {
  return (
    <section className="lp-light-section" id="features">
      <div className="lp-container">
        <p className="lp-pill">Why Choose AttendX</p>
        <h2 className="lp-section-title">
          Everything you need for
          <br />
          <span>smarter</span> attendance management
        </h2>

        <div className="lp-feature-grid">
          {CARDS.map((card) => (
            <article key={card.title} className="lp-feature-card">
              <div className={`lp-feature-icon ${card.tone}`} aria-hidden>
                <span />
              </div>
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
