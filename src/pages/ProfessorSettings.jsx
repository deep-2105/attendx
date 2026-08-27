export default function ProfessorSettings({ session }) {
  const profile = session?.profile || {};

  return (
    <div className="ax-page-enter" style={{ padding: 24 }}>
      <header className="topbar">
        <div>
          <p className="eyebrow">SETTINGS</p>
          <h1>Professor Settings</h1>
          <p className="subtitle">Manage your account and classroom preferences.</p>
        </div>
      </header>

      <section className="content-card" style={{ marginTop: 18 }}>
        <div className="section-header">
          <div>
            <h2>Profile</h2>
            <p>Current account details.</p>
          </div>
        </div>
        <div style={{ display: 'grid', gap: 14, paddingTop: 12 }}>
          <div><strong>Name:</strong> {profile.full_name || profile.name || 'Professor'}</div>
          <div><strong>Email:</strong> {session?.user?.email || session?.email || 'Not available'}</div>
          <div><strong>Role:</strong> {profile.role || 'professor'}</div>
          <div><strong>Department:</strong> {profile.department || 'Computer Science'}</div>
          <div><strong>Semester:</strong> {profile.semester || 'Current term'}</div>
        </div>
      </section>

      <section className="content-card" style={{ marginTop: 18 }}>
        <div className="section-header">
          <div>
            <h2>Attendance Settings</h2>
            <p>Current thresholds and class defaults.</p>
          </div>
        </div>
        <div style={{ display: 'grid', gap: 12, paddingTop: 12 }}>
          <div><strong>Minimum attendance threshold:</strong> 75%</div>
          <div><strong>Warning threshold:</strong> 80%</div>
          <div><strong>Default class mode:</strong> Present / Absent</div>
        </div>
      </section>

      <section className="content-card" style={{ marginTop: 18 }}>
        <div className="section-header">
          <div>
            <h2>Security</h2>
            <p>Current access model.</p>
          </div>
        </div>
        <div style={{ display: 'grid', gap: 12, paddingTop: 12 }}>
          <div>Authenticated users can access only the data allowed by their profile role.</div>
          <div>Students cannot manage professor-only data.</div>
          <div>Supabase RLS remains enabled and enforced.</div>
        </div>
      </section>
    </div>
  );
}
