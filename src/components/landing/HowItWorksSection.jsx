
const STEPS = [
  { num: '01', title: 'Login', desc: 'Secure login for students and professors.' },
  { num: '02', title: 'Track Attendance', desc: 'Mark attendance in seconds with real-time sync.' },
  { num: '03', title: 'Analyze', desc: 'AI-powered analytics provide insights that matter.' },
  { num: '04', title: 'Make Decisions', desc: 'Make informed decisions to improve academic outcomes.' },
];

export default function HowItWorksSection() {
  return (
    <section className="lp-section lp-how" id="how">
      <div className="lp-container">
        <p className="lp-pill">How It Works</p>
        <h2 className="lp-section-title dark">Simple Steps, Smarter Management</h2>
        <div className="lp-steps">
          {STEPS.map((step, index) => (
            <article key={step.num} className="lp-step-card">
              <div className="lp-step-top">
                <span className={`lp-step-bubble tone-${index + 1}`}>{step.num}</span>
                {index < STEPS.length - 1 && <span className="lp-step-connector" aria-hidden />}
              </div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
