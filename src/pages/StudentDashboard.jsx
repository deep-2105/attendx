import { useEffect, useMemo, useRef, useState } from 'react';
import { computeStudentOverall } from '../utils/attendance';

function classesToReachTarget(attended, total, targetPct) {
  const target = targetPct / 100;
  if (total <= 0) return 0;
  if (attended / total >= target) return 0;
  return Math.ceil((target * total - attended) / (1 - target));
}

function classesCanMiss(attended, total, targetPct) {
  const target = targetPct / 100;
  if (total <= 0 || attended / total < target) return 0;
  return Math.max(0, Math.floor(attended / target - total));
}

export default function StudentDashboard({ students, attendance, onLogout, session, view = 'student-dashboard', onNavigate = () => {} }) {
  const studentId = session?.profile?.id;
  const student = students.find((s) => s.id === studentId) || { name: 'Student', roll: 'N/A' };
  const stats = useMemo(
    () => (studentId ? computeStudentOverall(studentId, students, attendance) : null),
    [studentId, students, attendance]
  );
  const navItems = [
    { key: 'student-dashboard', label: 'Dashboard', icon: '▦' },
    { key: 'student-subjects', label: 'Subjects', icon: '▤' },
    { key: 'student-attendance', label: 'Attendance', icon: '✓' },
    { key: 'student-analytics', label: 'Analytics', icon: '◌' },
    { key: 'student-profile', label: 'Profile', icon: '◉' },
  ];

  const [targetPct, setTargetPct] = useState(75);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [progress, setProgress] = useState(0);
  const chartRef = useRef(null);

  useEffect(() => {
    const node = chartRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        const start = performance.now();
        const duration = 1100;
        let frame = 0;

        const tick = (now) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          setProgress(eased);
          if (t < 1) frame = requestAnimationFrame(tick);
        };

        frame = requestAnimationFrame(tick);
        observer.disconnect();
        return () => cancelAnimationFrame(frame);
      },
      { threshold: 0.35 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const trendData = useMemo(() => {
    if (!attendance || !studentId) return [];
    const ordered = [...attendance]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);

    return ordered.map((day) => {
      const record = (day.records || []).find((r) => r.studentId === studentId);
      const pct = record ? (record.present ? 100 : 0) : 0;
      return {
        date: day.date.slice(5).replace('-', '/'),
        pct,
      };
    });
  }, [attendance, studentId]);

  const points = useMemo(() => {
    if (!trendData.length) return [];
    const minPct = 0;
    const maxPct = 100;
    const usableW = 248;
    const usableH = 88;
    return trendData.map((item, i) => {
      const x = 12 + (i / Math.max(1, trendData.length - 1)) * usableW;
      const normalized = (item.pct - minPct) / Math.max(1, maxPct - minPct);
      const y = 98 - normalized * usableH;
      return { ...item, x, y };
    });
  }, [trendData]);

  const fullPath = useMemo(
    () => points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' '),
    [points]
  );

  const visiblePoints = Math.max(1, Math.floor(progress * points.length));
  const activePath = points
    .slice(0, visiblePoints)
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const ringPct = stats?.pct ?? 87;
  const currentAttended = stats?.present ?? 36;
  const currentConducted = stats?.totalDays ?? 50;
  const needToTarget = classesToReachTarget(currentAttended, currentConducted, targetPct);
  const canMiss = classesCanMiss(currentAttended, currentConducted, targetPct);

  const shortageMessage =
    needToTarget > 0
      ? `You need to attend the next ${needToTarget} classes consecutively to reach ${targetPct}%.`
      : `You can miss ${canMiss} more classes while staying above ${targetPct}%.`;

  const recentActivity = useMemo(() => {
    if (!attendance || attendance.length === 0 || !studentId) {
      return [
        { label: 'Attendance marked for Data Structures', time: 'Today, 10:24 AM' },
        { label: 'Performance updated', time: 'Yesterday, 6:17 PM' },
      ];
    }

    const days = [...attendance].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 2);
    return days.map((day, idx) => {
      const rec = (day.records || []).find((r) => r.studentId === studentId);
      return {
        label: rec?.present ? 'Attendance marked for your classes' : 'Attendance status updated',
        time: idx === 0 ? `Today, ${day.date}` : `Recently, ${day.date}`,
      };
    });
  }, [attendance, studentId]);

  const renderDashboardView = () => (
    <>
      <section className="ax-student-hero-grid">
        <article className="ax-student-greeting">
          <h1>Welcome back, Student 👋</h1>
          <p>Make the most of your learning journey.</p>
        </article>

        <article className="ax-attendance-ring-card">
          <p>Overall Attendance</p>
          <div className="ax-ring" style={{ '--pct': `${ringPct}%` }}>
            <div>
              <strong>{ringPct}%</strong>
              <span>Attendance</span>
            </div>
          </div>
        </article>
      </section>

      <section className="ax-student-section">
        <div className="ax-section-head">
          <h2>My Attendance Summary</h2>
          <button className="ax-link-btn" type="button">View All →</button>
        </div>

        <div className="ax-subject-grid">
          {stats ? (
            <article className="ax-subject-card">
              <h3>Overall Attendance</h3>
              <strong>{stats.pct}%</strong>
              <div className="ax-progress-track">
                <span style={{ width: `${stats.pct}%` }} />
              </div>
            </article>
          ) : (
            <div style={{ padding: 20, color: '#666' }}>No attendance data available yet.</div>
          )}
        </div>
      </section>

      <section className="ax-student-lower-grid">
        {points.length ? (
          <article className="ax-card ax-trend-card" ref={chartRef}>
            <div className="ax-section-head">
              <h2>Attendance Trend</h2>
              <span>This Month</span>
            </div>

            <div className="ax-trend-chart">
              <svg viewBox="0 0 280 120" preserveAspectRatio="none">
                <path className="ax-trend-base" d={fullPath} />
                <path className="ax-trend-line" d={activePath || fullPath} />
                {points.map((p, index) => (
                  <circle
                    key={p.date}
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    className="ax-trend-point"
                    style={{ opacity: index < visiblePoints ? 1 : 0 }}
                    onMouseEnter={() => setHoveredPoint(index)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                ))}
              </svg>

              {hoveredPoint !== null && points[hoveredPoint] && (
                <div
                  className="ax-chart-tooltip"
                  style={{
                    left: `${(points[hoveredPoint].x / 280) * 100}%`,
                    top: `${(points[hoveredPoint].y / 120) * 100}%`,
                  }}
                >
                  <strong>{points[hoveredPoint].date}</strong>
                  <span>{points[hoveredPoint].pct}%</span>
                </div>
              )}
            </div>
          </article>
        ) : (
          <article className="ax-card ax-trend-card" ref={chartRef}>
            <div className="ax-section-head">
              <h2>Attendance Trend</h2>
              <span>Waiting for data</span>
            </div>
            <div style={{ padding: 24, color: '#666' }}>No attendance history yet for this student.</div>
          </article>
        )}

        <article className="ax-card ax-bunk-card">
          <h2>Can I Bunk?</h2>
          <p>{needToTarget > 0 ? `Current Attendance: ${ringPct}%` : `Current Attendance: ${ringPct}%`}</p>
          <strong>{needToTarget > 0 ? `Need ${needToTarget} classes` : `You can bunk ${canMiss} classes today.`}</strong>

          <div className="ax-calc-grid">
            <label>
              <span>Target %</span>
              <input
                type="number"
                min="50"
                max="95"
                value={targetPct}
                onChange={(e) => setTargetPct(Math.max(50, Math.min(95, Number(e.target.value) || 75)))}
              />
            </label>
            <label>
              <span>Attended</span>
              <input type="number" value={currentAttended} readOnly />
            </label>
            <label>
              <span>Conducted</span>
              <input type="number" value={currentConducted} readOnly />
            </label>
          </div>

          <div className="ax-calc-result">{shortageMessage}</div>
        </article>
      </section>

      <section className="ax-card ax-activity-card">
        <div className="ax-section-head">
          <h2>Recent Activity</h2>
          <button className="ax-link-btn" type="button">View All →</button>
        </div>
        <div className="ax-activity-list">
          {recentActivity.map((item) => (
            <div key={`${item.label}-${item.time}`} className="ax-activity-item">
              <div className="ax-activity-dot" />
              <div>
                <strong>{item.label}</strong>
                <span>{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );

  const renderSubjectsView = () => {
    const entries = attendance.slice(-5).map((day) => ({
      date: day.date,
      present: (day.records || []).filter((r) => r.studentId === studentId && r.present).length,
      total: (day.records || []).filter((r) => r.studentId === studentId).length,
    }));

    return (
      <section className="ax-student-section">
        <div className="ax-section-head">
          <h2>Subjects Overview</h2>
          <button className="ax-link-btn" type="button" onClick={() => onNavigate('student-attendance')}>View Attendance →</button>
        </div>

        <div className="ax-subject-grid">
          {['Current Attendance', 'Classes Present', 'Classes Conducted', 'Attendance Trend'].map((label, idx) => {
            const values = [
              stats?.pct ?? 0,
              stats?.present ?? 0,
              stats?.totalDays ?? 0,
              Math.max(0, stats?.pct ?? 0),
            ];
            return (
              <article key={label} className="ax-subject-card">
                <h3>{label}</h3>
                <strong>{values[idx]}{label.includes('Attendance') && idx !== 2 ? '%' : ''}</strong>
                <div className="ax-progress-track">
                  <span style={{ width: `${Math.min(100, values[idx])}%` }} />
                </div>
              </article>
            );
          })}
        </div>

        <div className="ax-card" style={{ marginTop: 16, padding: 18 }}>
          <h3 style={{ margin: '0 0 10px' }}>Recent class records</h3>
          <div className="ax-activity-list">
            {entries.length ? entries.map((entry) => (
              <div key={entry.date} className="ax-activity-item">
                <div className="ax-activity-dot" />
                <div>
                  <strong>{entry.date}</strong>
                  <span>{entry.present} present / {entry.total || 0} marked</span>
                </div>
              </div>
            )) : (
              <div style={{ color: '#9bb0d6', padding: 6 }}>No class activity available yet.</div>
            )}
          </div>
        </div>
      </section>
    );
  };

  const renderAttendanceView = () => (
    <section className="ax-student-section">
      <div className="ax-section-head">
        <h2>My Attendance</h2>
        <button className="ax-link-btn" type="button" onClick={() => onNavigate('student-dashboard')}>Back to Dashboard →</button>
      </div>

      <div className="ax-card" style={{ marginTop: 16, padding: 18 }}>
        <div className="ax-activity-list">
          {attendance.length ? [...attendance].sort((a, b) => b.date.localeCompare(a.date)).map((day) => {
            const record = (day.records || []).find((r) => r.studentId === studentId);
            return (
              <div key={day.date} className="ax-activity-item">
                <div className="ax-activity-dot" style={{ background: record?.present ? '#22c55e' : '#fbbf24' }} />
                <div>
                  <strong>{day.date}</strong>
                  <span>{record ? (record.present ? 'Present' : 'Absent') : 'Not marked yet'}</span>
                </div>
              </div>
            );
          }) : (
            <div style={{ color: '#9bb0d6', padding: 6 }}>No attendance records available yet.</div>
          )}
        </div>
      </div>
    </section>
  );

  const renderAnalyticsView = () => (
    <section className="ax-student-section">
      <div className="ax-section-head">
        <h2>Analytics</h2>
      </div>

      <div className="ax-subject-grid">
        <article className="ax-subject-card">
          <h3>Overall</h3>
          <strong>{stats?.pct ?? 0}%</strong>
          <div className="ax-progress-track"><span style={{ width: `${stats?.pct ?? 0}%` }} /></div>
        </article>
        <article className="ax-subject-card">
          <h3>Present</h3>
          <strong>{stats?.present ?? 0}</strong>
          <div className="ax-progress-track"><span style={{ width: `${Math.min(100, (stats?.present ?? 0) * 10)}%` }} /></div>
        </article>
        <article className="ax-subject-card">
          <h3>Conducted</h3>
          <strong>{stats?.totalDays ?? 0}</strong>
          <div className="ax-progress-track"><span style={{ width: `${Math.min(100, (stats?.totalDays ?? 0) * 10)}%` }} /></div>
        </article>
      </div>

      <div className="ax-card" style={{ marginTop: 16, padding: 18 }}>
        <h3 style={{ margin: '0 0 10px' }}>Performance summary</h3>
        <p style={{ margin: 0, color: '#c8d6f8' }}>
          {needToTarget > 0
            ? `You need ${needToTarget} more successful class appearances to reach ${targetPct}%.`
            : `You are comfortably above ${targetPct}% attendance and can miss up to ${canMiss} more classes.`}
        </p>
      </div>
    </section>
  );

  const renderProfileView = () => (
    <section className="ax-student-section">
      <div className="ax-section-head">
        <h2>Profile</h2>
      </div>

      <div className="ax-card" style={{ marginTop: 16, padding: 18 }}>
        <div style={{ display: 'grid', gap: 14 }}>
          <div><strong>Name:</strong> {student.name}</div>
          <div><strong>Roll No:</strong> {student.roll}</div>
          <div><strong>Email:</strong> {session?.user?.email || 'Not available'}</div>
          <div><strong>Overall Attendance:</strong> {stats?.pct ?? 0}%</div>
          <div><strong>Current status:</strong> {stats && stats.pct >= 75 ? 'On track' : 'Needs attention'}</div>
        </div>
      </div>
    </section>
  );

  const currentContent = {
    'student-dashboard': renderDashboardView(),
    'student-subjects': renderSubjectsView(),
    'student-attendance': renderAttendanceView(),
    'student-analytics': renderAnalyticsView(),
    'student-profile': renderProfileView(),
  }[view] || renderDashboardView();

  return (
    <div className="ax-student-page ax-page-enter">
      <aside className="ax-student-sidebar">
        <div className="ax-brand">
          <span className="ax-brand-mark">A</span>
          <div>
            <strong>AttendX</strong>
            <small>Smart Attendance. Smarter Decisions.</small>
          </div>
        </div>

        <nav className="ax-student-nav" aria-label="Student navigation">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`ax-student-nav-item ${view === item.key ? 'active' : ''}`}
              onClick={() => onNavigate(item.key)}
            >
              <span className="ax-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="ax-student-sidebar-bottom">
          <div className="ax-student-profile-chip">
            <div className="ax-student-avatar">{student.name?.charAt(0) || 'S'}</div>
            <div>
              <strong>{student.name || 'Student'}</strong>
              <small>{student.roll && student.roll !== 'N/A' ? `Roll: ${student.roll}` : 'Student'}</small>
            </div>
          </div>
          <div className="ax-student-logout-wrap">
            <button className="ax-student-logout" type="button" onClick={onLogout}>Logout</button>
          </div>
        </div>
      </aside>

      <div className="ax-student-main">
        <header className="ax-student-topbar">
          <div className="ax-brand compact">
            <span className="ax-brand-mark">A</span>
            <div>
              <strong>AttendX</strong>
              <small>Smart Attendance. Smarter Decisions.</small>
            </div>
          </div>

          <div className="ax-student-top-actions">
            <div className="ax-student-user-info">
              <strong>{student.name || 'Student'}</strong>
              <small>{student.roll && student.roll !== 'N/A' ? `Roll: ${student.roll}` : 'Student'}</small>
            </div>
            <div className="ax-user-chip">
              <span>{student.name?.charAt(0) || 'S'}</span>
            </div>
          </div>
        </header>

        {currentContent}

        <nav className="ax-student-bottom-nav" aria-label="Student mobile navigation">
          {navItems.map((item) => (
            <button
              key={`mobile-${item.key}`}
              type="button"
              className={`ax-mobile-nav-item ${view === item.key ? 'active' : ''}`}
              onClick={() => onNavigate(item.key)}
            >
              <span className="ax-mobile-nav-icon">{item.icon}</span>
              <span className="ax-mobile-nav-label">{item.label}</span>
            </button>
          ))}
          <button type="button" className="ax-mobile-nav-item ax-mobile-logout" onClick={onLogout}>
            <span className="ax-mobile-nav-icon">⏻</span>
            <span className="ax-mobile-nav-label">Logout</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
