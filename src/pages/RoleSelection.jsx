export default function RoleSelection({ onNavigate }){
  const handleRoleKey = (e, role) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onNavigate(role === 'student' ? 'student-login' : 'professor-login');
    }
  };

  return (
    <div className="ax-role-page ax-page-enter">
      <header className="ax-topbar ax-topbar-compact">
        <div className="ax-brand">
          <span className="ax-brand-mark">A</span>
          <div>
            <strong>AttendX</strong>
            <small>Smart Attendance. Smarter Decisions.</small>
          </div>
        </div>

        <div className="ax-topbar-actions">
          <button className="ax-ghost-btn" onClick={() => onNavigate('role-select')}>Login</button>
        </div>
      </header>

      <main className="ax-role-main">
        <h1>Welcome back!</h1>
        <p>Choose your role to continue</p>

        <div className="ax-role-grid">
          <button
            type="button"
            className="ax-role-card student"
            onClick={() => onNavigate('student-login')}
            onKeyDown={(e) => handleRoleKey(e, 'student')}
          >
            <div className="ax-role-icon">🎓</div>
            <div>
              <h2>Student</h2>
              <p>Track your attendance, analyze performance, and make smarter academic decisions.</p>
              <span>Continue as Student →</span>
            </div>
          </button>

          <button
            type="button"
            className="ax-role-card professor"
            onClick={() => onNavigate('professor-login')}
            onKeyDown={(e) => handleRoleKey(e, 'professor')}
          >
            <div className="ax-role-icon">🪪</div>
            <div>
              <h2>Professor</h2>
              <p>Manage classes, track attendance, identify at-risk students, and generate useful academic insights.</p>
              <span>Continue as Professor →</span>
            </div>
          </button>
        </div>

        <footer className="ax-role-footer">© 2026 AttendX. University Specific Projects / ATTENDANCE SHORTAGE CALCULATOR</footer>
      </main>

    </div>
  );
}
