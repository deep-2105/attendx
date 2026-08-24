import { useEffect, useMemo, useRef, useState } from 'react';

const TREND = [
  { date: 'Aug 1', pct: 58 },
  { date: 'Aug 5', pct: 64 },
  { date: 'Aug 8', pct: 69 },
  { date: 'Aug 12', pct: 63 },
  { date: 'Aug 16', pct: 74 },
  { date: 'Aug 20', pct: 79 },
  { date: 'Aug 24', pct: 87 },
];

const STUDENT_SUBJECTS = [
  { name: 'Data Structures', pct: 92 },
  { name: 'Database Systems', pct: 85 },
  { name: 'Operating Systems', pct: 78 },
  { name: 'Computer Networks', pct: 90 },
  { name: 'Web Development', pct: 88 },
];

const PRESENT = 112;
const ABSENT = 12;
const TOTAL = PRESENT + ABSENT;

export default function DashboardPreview() {
  const rootRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [donutHover, setDonutHover] = useState(null);
  const [role, setRole] = useState('professor');

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const target = rootRef.current;
    if (!target) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.35 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return undefined;
    if (prefersReducedMotion) return undefined;

    const start = performance.now();
    const duration = 1300;
    let frame = 0;

    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, prefersReducedMotion]);

  const chartPoints = useMemo(() => {
    const minPct = 50;
    const maxPct = 90;
    const usableW = 238;
    const usableH = 58;
    return TREND.map((item, i) => {
      const x = 10 + (i / (TREND.length - 1)) * usableW;
      const normalized = (item.pct - minPct) / (maxPct - minPct);
      const y = 74 - normalized * usableH;
      return { ...item, x, y };
    });
  }, []);

  const trendPath = useMemo(
    () => chartPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' '),
    [chartPoints]
  );

  const displayProgress = prefersReducedMotion && inView ? 1 : progress;
  const visiblePoints = Math.max(1, Math.floor(displayProgress * chartPoints.length));
  const activeTrend = chartPoints.slice(0, visiblePoints);
  const animatedPath = activeTrend
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const animatedTotal = Math.round(TOTAL * displayProgress);
  const animatedPresent = Math.round(PRESENT * displayProgress);

  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const presentRatio = PRESENT / TOTAL;
  const presentLen = circumference * presentRatio * displayProgress;
  const absentLen = circumference * (1 - presentRatio) * displayProgress;

  const donutTooltip =
    donutHover === 'present'
      ? `Present - ${PRESENT} students`
      : donutHover === 'absent'
      ? `Absent - ${ABSENT} students`
      : '';

  const sidebarItems =
    role === 'professor'
      ? ['Dashboard', 'Students', 'Attendance', 'Reports', 'Analytics', 'Settings']
      : ['Dashboard', 'Subjects', 'Attendance', 'Insights', 'Can I Bunk?', 'Settings'];

  return (
    <article
      className={`lp-dash-preview ${role === 'student' ? 'student-view' : 'professor-view'}`}
      aria-label="AttendX dashboard preview"
      ref={rootRef}
    >
      <aside className="lp-dash-sidebar">
        <div className="lp-dash-brand">
          <span className="lp-dash-brand-mark">A</span>
          <div>
            <strong>AttendX</strong>
            <small>{role === 'professor' ? 'Professor View' : 'Student View'}</small>
          </div>
        </div>

        <nav className="lp-dash-menu" aria-label="Preview navigation">
          {sidebarItems.map((item, idx) => (
            <span key={item} className={`lp-dash-menu-item ${idx === 0 ? 'active' : ''}`}>
              {item}
            </span>
          ))}
        </nav>

        <div className="lp-dash-profile">
          <span className="lp-avatar">{role === 'professor' ? 'PS' : 'AR'}</span>
          <div>
            <strong>{role === 'professor' ? 'Prof. Sharma' : 'Aarav Rao'}</strong>
            <small>{role === 'professor' ? 'Computer Science' : 'B.Tech CSE'}</small>
          </div>
        </div>
      </aside>

      <section className="lp-dash-main">
        <header className="lp-dash-main-head">
          <div>
            <p className="lp-dash-overline">Dashboard</p>
            <h3>{role === 'professor' ? 'Welcome back, Professor 👋' : 'Welcome back, Student 👋'}</h3>
          </div>

          <div className="lp-main-head-right">
            <div className="lp-view-toggle" role="tablist" aria-label="Dashboard role switch">
              <button
                role="tab"
                aria-selected={role === 'professor'}
                className={role === 'professor' ? 'active' : ''}
                onClick={() => setRole('professor')}
              >
                Professor View
              </button>
              <button
                role="tab"
                aria-selected={role === 'student'}
                className={role === 'student' ? 'active' : ''}
                onClick={() => setRole('student')}
              >
                Student View
              </button>
            </div>
            <span className="lp-dash-date">August 24, 2026</span>
          </div>
        </header>

        {role === 'professor' ? (
          <>
            <div className="lp-kpis">
              <div className="lp-kpi"><small>Total Students</small><strong>{animatedTotal}</strong></div>
              <div className="lp-kpi"><small>Present Today</small><strong>{animatedPresent}</strong></div>
              <div className="lp-kpi"><small>Average Attendance</small><strong>{Math.round(87 * displayProgress)}%</strong></div>
              <div className="lp-kpi"><small>At Risk Students</small><strong>{Math.round(8 * displayProgress)}</strong></div>
            </div>

            <div className="lp-charts">
              <div className="lp-chart-card">
                <div className="lp-chart-head">
                  <span>Attendance Trend</span>
                  <small>This Month</small>
                </div>
                <div className="lp-line-chart" role="img" aria-label="Attendance trend chart">
                  <svg viewBox="0 0 260 90" preserveAspectRatio="none">
                    <path className="lp-trend-path-base" d={trendPath} />
                    <path className="lp-trend-path" d={animatedPath || trendPath} />
                    {chartPoints.map((p, index) => {
                      const visible = index < visiblePoints;
                      return (
                        <circle
                          key={p.date}
                          cx={p.x}
                          cy={p.y}
                          r={4}
                          className="lp-trend-point"
                          style={{ opacity: visible ? 1 : 0 }}
                          onMouseEnter={() => setHoveredPoint(index)}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                      );
                    })}
                  </svg>

                  {hoveredPoint !== null && chartPoints[hoveredPoint] && (
                    <div
                      className="lp-chart-tooltip"
                      style={{
                        left: `${(chartPoints[hoveredPoint].x / 260) * 100}%`,
                        top: `${(chartPoints[hoveredPoint].y / 90) * 100}%`,
                      }}
                    >
                      <strong>{chartPoints[hoveredPoint].date}</strong>
                      <span>{chartPoints[hoveredPoint].pct}% attendance</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="lp-chart-card">
                <div className="lp-chart-head">
                  <span>Present vs Absent</span>
                  <small>Today</small>
                </div>
                <div className="lp-donut-wrap">
                  <div
                    className="lp-donut-shell"
                    onMouseLeave={() => setDonutHover(null)}
                    aria-label="Present versus absent donut chart"
                  >
                    {donutTooltip && <div className="lp-donut-tooltip">{donutTooltip}</div>}

                    <svg className="lp-donut" viewBox="0 0 120 120">
                      <g transform="translate(60,60) rotate(-90)">
                        <circle r={radius} className="lp-donut-track" />
                        <circle
                          r={radius}
                          className={`lp-donut-segment present ${donutHover === 'present' ? 'active' : ''}`}
                          strokeDasharray={`${presentLen} ${circumference - presentLen}`}
                          strokeDashoffset="0"
                          onMouseEnter={() => setDonutHover('present')}
                        />
                        <circle
                          r={radius}
                          className={`lp-donut-segment absent ${donutHover === 'absent' ? 'active' : ''}`}
                          strokeDasharray={`${absentLen} ${circumference - absentLen}`}
                          strokeDashoffset={-presentLen}
                          onMouseEnter={() => setDonutHover('absent')}
                        />
                      </g>
                    </svg>

                    <span className="lp-donut-center">
                      <strong>{animatedTotal}</strong>
                      <small>Total</small>
                    </span>
                  </div>

                  <div className="lp-donut-legend">
                    <div
                      className={donutHover === 'present' ? 'active' : ''}
                      onMouseEnter={() => setDonutHover('present')}
                    >
                      <i className="present" /> Present {PRESENT} ({Math.round((PRESENT / TOTAL) * 100)}%)
                    </div>
                    <div
                      className={donutHover === 'absent' ? 'active' : ''}
                      onMouseEnter={() => setDonutHover('absent')}
                    >
                      <i className="absent" /> Absent {ABSENT} ({Math.round((ABSENT / TOTAL) * 100)}%)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="lp-student-grid">
            <article className="lp-student-card lp-overall-card">
              <p>Overall Attendance</p>
              <strong>{Math.round(87 * displayProgress)}%</strong>
              <span>You are doing great.</span>
            </article>

            <article className="lp-student-card lp-subject-card">
              <h4>Subjects</h4>
              <div className="lp-subject-list">
                {STUDENT_SUBJECTS.map((subject) => (
                  <div key={subject.name} className="lp-subject-item">
                    <div className="lp-subject-row">
                      <span>{subject.name}</span>
                      <strong>{subject.pct}%</strong>
                    </div>
                    <div className="lp-subject-track">
                      <span style={{ width: `${subject.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="lp-student-card lp-bunk-card">
              <h4>Can I Bunk Today? 😎</h4>
              <p>You can bunk 2 classes today.</p>
              <div className="lp-bunk-meta">
                <span>Subject-wise Attendance</span>
                <span>Personal Attendance Insights</span>
              </div>
            </article>

            <article className="lp-student-card lp-trend-card">
              <div className="lp-chart-head">
                <span>Attendance Trend</span>
                <small>This Month</small>
              </div>
              <div className="lp-line-chart lp-line-chart-student" role="img" aria-label="Student attendance trend chart">
                <svg viewBox="0 0 260 90" preserveAspectRatio="none">
                  <path className="lp-trend-path-base" d={trendPath} />
                  <path className="lp-trend-path" d={animatedPath || trendPath} />
                  {chartPoints.map((p, index) => {
                    const visible = index < visiblePoints;
                    return (
                      <circle
                        key={`student-${p.date}`}
                        cx={p.x}
                        cy={p.y}
                        r={4}
                        className="lp-trend-point"
                        style={{ opacity: visible ? 1 : 0 }}
                        onMouseEnter={() => setHoveredPoint(index)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    );
                  })}
                </svg>

                {hoveredPoint !== null && chartPoints[hoveredPoint] && (
                  <div
                    className="lp-chart-tooltip"
                    style={{
                      left: `${(chartPoints[hoveredPoint].x / 260) * 100}%`,
                      top: `${(chartPoints[hoveredPoint].y / 90) * 100}%`,
                    }}
                  >
                    <strong>{chartPoints[hoveredPoint].date}</strong>
                    <span>{chartPoints[hoveredPoint].pct}% attendance</span>
                  </div>
                )}
              </div>
            </article>
          </div>
        )}
      </section>
    </article>
  );
}
