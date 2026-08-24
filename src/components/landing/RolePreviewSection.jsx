
export default function RolePreviewSection({ onNavigate }) {
  return (
    <section className="lp-section lp-roles" id="about">
      <div className="lp-container">
        <h2 className="lp-section-title dark">
          Powerful dashboards for <span>every role</span>
        </h2>

        <div className="lp-role-grid">
          <article className="lp-role-card professor" id="professors">
            <h3>For Professors</h3>
            <p>Manage classes, track attendance, identify at-risk students, and generate insights.</p>
            <ul>
              <li>Student management</li>
              <li>Attendance tracking</li>
              <li>At-risk student alerts</li>
              <li>Reports &amp; analytics</li>
              <li>Export &amp; share data</li>
            </ul>
            <button className="lp-btn lp-btn-secondary" onClick={() => onNavigate('professor-login')}>Explore Professor Dashboard</button>
          </article>

          <article className="lp-role-card student" id="students">
            <h3>For Students</h3>
            <p>Track your attendance, analyze performance, and make smarter academic decisions.</p>
            <ul>
              <li>Personal attendance tracking</li>
              <li>Subject-wise insights</li>
              <li>Attendance predictions</li>
              <li>Bunk analysis</li>
              <li>Performance overview</li>
            </ul>
            <button className="lp-btn lp-btn-secondary" onClick={() => onNavigate('student-login')}>Explore Student Dashboard</button>
          </article>
        </div>
      </div>
    </section>
  );
}
