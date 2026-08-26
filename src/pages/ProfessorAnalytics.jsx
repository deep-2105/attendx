import { useMemo } from 'react';

export default function ProfessorAnalytics({ students, attendance }) {
  const stats = useMemo(() => {
    const totalStudents = students.length;
    const allDays = attendance.filter((day) => Array.isArray(day.records) && day.records.length > 0);
    const totalRecords = allDays.reduce((sum, day) => sum + day.records.length, 0);
    const presentRecords = allDays.reduce((sum, day) => sum + day.records.filter((r) => r.present).length, 0);
    const absentRecords = Math.max(0, totalRecords - presentRecords);

    const studentStats = students.map((student) => {
      const studentDays = allDays.filter((day) => day.records.some((r) => r.studentId === student.id));
      const present = studentDays.filter((day) => day.records.some((r) => r.studentId === student.id && r.present)).length;
      const total = studentDays.length;
      const pct = total ? Math.round((present / total) * 100) : 0;
      return { ...student, total, present, pct };
    });

    const averagePct = totalStudents && allDays.length
      ? Math.round(studentStats.reduce((sum, item) => sum + item.pct, 0) / totalStudents)
      : 0;

    const best = [...studentStats].sort((a, b) => b.pct - a.pct)[0];
    const worst = [...studentStats].sort((a, b) => a.pct - b.pct)[0];
    const atRisk = studentStats.filter((s) => s.pct < 75).length;

    return {
      totalStudents,
      totalRecords,
      presentRecords,
      absentRecords,
      averagePct,
      best,
      worst,
      atRisk,
      studentStats,
    };
  }, [students, attendance]);

  const trendData = useMemo(() => {
    const ordered = [...attendance].sort((a, b) => a.date.localeCompare(b.date)).slice(-7);
    return ordered.map((day) => {
      const present = (day.records || []).filter((r) => r.present).length;
      const total = (day.records || []).length || students.length || 1;
      return {
        date: day.date.slice(5).replace('-', '/'),
        pct: total ? Math.round((present / total) * 100) : 0,
      };
    });
  }, [attendance, students.length]);

  return (
    <div className="ax-page-enter" style={{ padding: 24 }}>
      <header className="topbar">
        <div>
          <p className="eyebrow">ANALYTICS</p>
          <h1>Professor Analytics</h1>
          <p className="subtitle">Live class performance and attendance insights.</p>
        </div>
      </header>

      <section className="stats">
        <div className="stat-card">
          <div className="stat-icon blue">◉</div>
          <div>
            <span>Average Attendance</span>
            <strong>{stats.averagePct}%</strong>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✓</div>
          <div>
            <span>Present Records</span>
            <strong>{stats.presentRecords}</strong>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">×</div>
          <div>
            <span>Absent Records</span>
            <strong>{stats.absentRecords}</strong>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">!</div>
          <div>
            <span>At Risk</span>
            <strong>{stats.atRisk}</strong>
          </div>
        </div>
      </section>

      <section className="content-card" style={{ marginTop: 18 }}>
        <div className="section-header">
          <div>
            <h2>Traveling Attendance Trend</h2>
            <p>Last 7 recorded days.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
          {trendData.length === 0 ? (
            <div style={{ padding: 20, color: '#666' }}>No attendance data available yet.</div>
          ) : (
            trendData.map((item) => (
              <div key={item.date} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 60px', gap: 12, alignItems: 'center' }}>
                <strong>{item.date}</strong>
                <div style={{ height: 10, borderRadius: 999, background: '#eef1ff', overflow: 'hidden' }}>
                  <div style={{ width: `${item.pct}%`, height: '100%', background: '#6958dc', borderRadius: 999 }} />
                </div>
                <span>{item.pct}%</span>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="content-card" style={{ marginTop: 18 }}>
        <div className="section-header">
          <div>
            <h2>Class Insights</h2>
            <p>High and low performers across the current dataset.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, paddingTop: 12 }}>
          <div style={{ background: '#f7f7ff', padding: 16, borderRadius: 12 }}>
            <small>Top performer</small>
            <h3 style={{ margin: '8px 0 4px' }}>{stats.best ? stats.best.name : '—'}</h3>
            <div>{stats.best ? `${stats.best.pct}% overall` : 'No data'}</div>
          </div>
          <div style={{ background: '#fff5f5', padding: 16, borderRadius: 12 }}>
            <small>Needs attention</small>
            <h3 style={{ margin: '8px 0 4px' }}>{stats.worst ? stats.worst.name : '—'}</h3>
            <div>{stats.worst ? `${stats.worst.pct}% overall` : 'No data'}</div>
          </div>
        </div>
      </section>
    </div>
  );
}
