import { useEffect, useMemo, useRef, useState } from 'react';
import { formatDate } from '../storage';
import { computeStudentOverall } from '../utils/attendance';

export default function Dashboard({ students, attendance, goTo }) {
  const today = formatDate();
  const todayRecord = attendance.find((a) => a.date === today) || { records: [] };
  const presentCount = todayRecord.records.filter((r) => r.present).length;
  const total = students.length;
  const absentCount = Math.max(0, total - presentCount);
  const attendancePercentage = total ? Math.round((presentCount / total) * 100) : 0;

  const trendPoints = useMemo(() => {
    const orderedDays = [...attendance].sort((a, b) => a.date.localeCompare(b.date)).slice(-7);
    if (!orderedDays.length) return [];

    return orderedDays.map((day) => {
      const present = (day.records || []).filter((r) => r.present).length;
      const pct = total ? Math.round((present / total) * 100) : 0;
      return {
        date: day.date.slice(5).replace('-', '/'),
        pct,
      };
    });
  }, [attendance, total]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('attendance');
  const [progress, setProgress] = useState(0);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [donutHover, setDonutHover] = useState(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const node = chartRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        const start = performance.now();
        const duration = 1200;
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
      { threshold: 0.3 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const chartPoints = useMemo(() => {
    if (!trendPoints.length) return [];
    const minPct = 50;
    const maxPct = 95;
    const usableW = 248;
    const usableH = 88;
    return trendPoints.map((item, i) => {
      const x = 12 + (i / Math.max(1, trendPoints.length - 1)) * usableW;
      const normalized = (item.pct - minPct) / Math.max(1, maxPct - minPct);
      const y = 98 - normalized * usableH;
      return { ...item, x, y };
    });
  }, [trendPoints]);

  const trendPath = useMemo(
    () => chartPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' '),
    [chartPoints]
  );

  const visiblePoints = Math.max(1, Math.floor(progress * chartPoints.length));
  const animatedPath = chartPoints
    .slice(0, visiblePoints)
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const presentRatio = total ? presentCount / total : 0;
  const presentLen = circumference * presentRatio * progress;
  const absentLen = circumference * (1 - presentRatio) * progress;

  const rows = useMemo(() => {
    return students.map((student) => {
      const overall = computeStudentOverall(student.id, students, attendance);
      const todayStatus = todayRecord.records.find((r) => r.studentId === student.id)?.present;
      const status = overall.pct >= 75 ? (todayStatus ? 'Present' : 'Safe') : 'At Risk';
      return {
        id: student.id,
        name: student.name,
        roll: student.roll,
        attendance: overall.pct,
        status,
      };
    });
  }, [students, attendance, todayRecord.records]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = rows.filter((row) => {
      const matchesSearch = !q || row.name.toLowerCase().includes(q) || row.roll.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || row.status.toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });

    if (sortBy === 'name') list = list.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'roll') list = list.sort((a, b) => a.roll.localeCompare(b.roll));
    if (sortBy === 'attendance') list = list.sort((a, b) => b.attendance - a.attendance);

    return list;
  }, [rows, search, statusFilter, sortBy]);

  const atRiskCount = rows.filter((r) => r.status === 'At Risk').length;
  const donutTooltip =
    donutHover === 'present'
      ? `Present - ${presentCount} students`
      : donutHover === 'absent'
      ? `Absent - ${absentCount} students`
      : '';

  return (
    <div className="ax-prof-dashboard ax-page-enter">
      <header className="ax-prof-head">
        <div>
          <h1>Welcome back, Professor 👋</h1>
          <p>Manage your classroom with confidence.</p>
        </div>
        <div className="ax-date-pill">{today}</div>
      </header>

      <section className="ax-prof-kpis">
        <article className="ax-prof-kpi"><span>Total Students</span><strong>{total}</strong></article>
        <article className="ax-prof-kpi"><span>Present Today</span><strong>{Math.round(presentCount * progress)}</strong></article>
        <article className="ax-prof-kpi"><span>Average Attendance</span><strong>{Math.round(attendancePercentage * progress)}%</strong></article>
        <article className="ax-prof-kpi"><span>At Risk Students</span><strong>{Math.round(atRiskCount * progress)}</strong></article>
      </section>

      {trendPoints.length === 0 ? (
        <section className="ax-prof-charts" ref={chartRef}>
          <article className="ax-card ax-prof-trend">
            <div className="ax-section-head">
              <h2>Attendance Trend</h2>
              <span>Waiting for data</span>
            </div>
            <div style={{ padding: 24, color: '#666' }}>No attendance records yet. Mark the first class attendance to generate the trend.</div>
          </article>
        </section>
      ) : (
        <section className="ax-prof-charts" ref={chartRef}>
          <article className="ax-card ax-prof-trend">
            <div className="ax-section-head">
              <h2>Attendance Trend</h2>
              <span>This Month</span>
            </div>

            <div className="ax-trend-chart">
              <svg viewBox="0 0 280 120" preserveAspectRatio="none">
                <path className="ax-trend-base" d={trendPath} />
                <path className="ax-trend-line" d={animatedPath || trendPath} />
                {chartPoints.map((p, index) => (
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

              {hoveredPoint !== null && chartPoints[hoveredPoint] && (
                <div
                  className="ax-chart-tooltip"
                  style={{
                    left: `${(chartPoints[hoveredPoint].x / 280) * 100}%`,
                    top: `${(chartPoints[hoveredPoint].y / 120) * 100}%`,
                  }}
                >
                  <strong>{chartPoints[hoveredPoint].date}</strong>
                  <span>{chartPoints[hoveredPoint].pct}%</span>
                </div>
              )}
            </div>
          </article>

        <article className="ax-card ax-prof-donut-card">
          <div className="ax-section-head">
            <h2>Present vs Absent</h2>
            <span>Today</span>
          </div>

          <div className="ax-donut-wrap">
            <div className="ax-donut-shell" onMouseLeave={() => setDonutHover(null)}>
              {donutTooltip && <div className="ax-donut-tooltip">{donutTooltip}</div>}
              <svg className="ax-donut" viewBox="0 0 120 120">
                <g transform="translate(60,60) rotate(-90)">
                  <circle r={radius} className="ax-donut-track" />
                  <circle
                    r={radius}
                    className={`ax-donut-segment present ${donutHover === 'present' ? 'active' : ''}`}
                    strokeDasharray={`${presentLen} ${circumference - presentLen}`}
                    strokeDashoffset="0"
                    onMouseEnter={() => setDonutHover('present')}
                  />
                  <circle
                    r={radius}
                    className={`ax-donut-segment absent ${donutHover === 'absent' ? 'active' : ''}`}
                    strokeDasharray={`${absentLen} ${circumference - absentLen}`}
                    strokeDashoffset={-presentLen}
                    onMouseEnter={() => setDonutHover('absent')}
                  />
                </g>
              </svg>
              <div className="ax-donut-center">
                <strong>{Math.round(total * progress)}</strong>
                <small>Total</small>
              </div>
            </div>

            <div className="ax-donut-legend">
              <div className={donutHover === 'present' ? 'active' : ''} onMouseEnter={() => setDonutHover('present')}>
                <i className="present" /> Present {presentCount} ({total ? Math.round((presentCount / total) * 100) : 0}%)
              </div>
              <div className={donutHover === 'absent' ? 'active' : ''} onMouseEnter={() => setDonutHover('absent')}>
                <i className="absent" /> Absent {absentCount} ({total ? Math.round((absentCount / total) * 100) : 0}%)
              </div>
            </div>
          </div>
        </article>
        </section>
      )}

      <section className="ax-card ax-prof-table-card">
        <div className="ax-section-head">
          <h2>Students Overview</h2>
          <button className="ax-link-btn" onClick={() => goTo('students')}>View All →</button>
        </div>

        <div className="ax-table-toolbar">
          <label className="ax-table-search">
            <span>⌕</span>
            <input
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>

          <div className="ax-table-filters">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="present">Present</option>
              <option value="safe">Safe</option>
              <option value="at risk">At Risk</option>
            </select>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="attendance">Sort by Attendance</option>
              <option value="name">Sort by Name</option>
              <option value="roll">Sort by Roll No</option>
            </select>
          </div>
        </div>

        <div className="ax-table-wrap">
          <table className="ax-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Roll No</th>
                <th>Attendance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan="4" className="ax-empty-cell">No matching students found.</td>
                </tr>
              )}
              {filteredRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>{row.roll}</td>
                  <td>{row.attendance}%</td>
                  <td>
                    <span className={`ax-status ${row.status === 'At Risk' ? 'risk' : 'present'}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
