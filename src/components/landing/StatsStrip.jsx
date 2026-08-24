
const ITEMS = [
  { value: '500+', label: 'Institutions', icon: 'cap' },
  { value: '50K+', label: 'Students', icon: 'users' },
  { value: '1M+', label: 'Attendance Records', icon: 'trend' },
  { value: '99.9%', label: 'Uptime', icon: 'shield' },
];

export default function StatsStrip() {
  return (
    <section className="lp-stats-wrap" aria-label="AttendX impact stats">
      <div className="lp-container">
        <div className="lp-stats-strip">
          {ITEMS.map((item) => (
            <div key={item.label} className="lp-stat-item">
              <span className={`lp-stat-icon ${item.icon}`} aria-hidden>
                <span />
              </span>
              <div>
                <strong>{item.value}</strong>
                <p>{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
