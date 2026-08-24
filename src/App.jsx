import { useEffect, useState } from "react";
import "./App.css";
import { ToastProvider } from "./components/Toast";

import { loadStudents, saveStudents, loadAttendance, saveAttendance } from "./storage";
import db from './services/db';

import Dashboard from "./pages/Dashboard";
import StudentsPage from "./pages/Students";
import AttendancePage from "./pages/Attendance";
import ReportsPage from "./pages/Reports";
import Landing from "./pages/Landing";
import RoleSelection from "./pages/RoleSelection";
import ProfessorLogin from "./pages/ProfessorLogin";
import StudentLogin from "./pages/StudentLogin";
import StudentDashboard from "./pages/StudentDashboard";
import RequireRole from './components/RequireRole';
import AccessDenied from './components/AccessDenied';
import Background from './components/Background';
import auth from "./auth";
import supabase from './utils/supabase';

function App() {
  const [active, setActive] = useState('landing');
  const [students, setStudents] = useState(() => loadStudents());
  const [attendance, setAttendance] = useState(() => loadAttendance());
  const [session, setSession] = useState(null);

  useEffect(() => {
    saveStudents(students);
  }, [students]);

  useEffect(() => {
    saveAttendance(attendance);
  }, [attendance]);

  // Do not query protected Supabase tables before authentication. The old
  // implementation fetched profiles/attendance on first render, which caused
  // a flood of 401/403 requests and made the UI look broken before login.
  useEffect(() => {
    let mounted = true;
    if (!session || !db.isSupabaseConfigured()) return undefined;

    (async () => {
      try {
        const [s, a] = await Promise.all([db.fetchStudents(), db.fetchAttendance()]);
        if (!mounted) return;
        setStudents(s);
        setAttendance(a);
      } catch (e) {
        console.warn('Supabase sync failed after authentication', e);
      }
    })();

    return () => { mounted = false; };
  }, [session]);

  const setStudentsWrapper = (updater) => {
    setStudents((cur) => {
      const next = typeof updater === 'function' ? updater(cur) : updater;
      (async () => {
        if (!db.isSupabaseConfigured() || !session) return;
        const added = next.filter(n => !cur.find(c => c.id === n.id));
        const removed = cur.filter(c => !next.find(n => n.id === c.id));
        const maybeUpdated = next.filter(n => cur.find(c => c.id === n.id && JSON.stringify(c) !== JSON.stringify(n)));
        try {
          for (const r of added) await db.addStudent(r);
          for (const r of maybeUpdated) await db.updateStudent(r);
          for (const r of removed) await db.removeStudent(r.id);
        } catch (e) {
          console.warn('sync students error', e);
        }
      })();
      return next;
    });
  };

  const setAttendanceWrapper = (updater) => {
    setAttendance((cur) => {
      const next = typeof updater === 'function' ? updater(cur) : updater;
      (async () => {
        if (!db.isSupabaseConfigured() || !session) return;
        try {
          for (const day of next) {
            await db.upsertAttendanceRecordsForDate(day.date, day.records);
          }
        } catch (e) {
          console.warn('sync attendance error', e);
        }
      })();
      return next;
    });
  };

  function handleLogin(newSession) {
    setSession(newSession);
    const role = newSession?.profile?.role;
    setActive(role === 'professor' ? 'dashboard' : role === 'student' ? 'student-dashboard' : 'landing');
  }

  function handleLogout() {
    auth.signOut();
    setSession(null);
    setActive('landing');
  }

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const current = await auth.getCurrentSession();
        if (!mounted || !current) return;
        setSession(current);
        const role = current.profile?.role;
        setActive(role === 'professor' ? 'dashboard' : role === 'student' ? 'student-dashboard' : 'landing');
      } catch (e) {
        console.warn('failed to init session', e);
      }
    })();

    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' && mounted) {
        setSession(null);
        setActive('landing');
      }
    });

    return () => {
      mounted = false;
      data?.subscription?.unsubscribe?.();
    };
  }, []);

  const Nav = () => {
    if (!session || session.profile?.role !== 'professor') return null;
    return (
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">A</div>
          <div>
            <h2>AttendX</h2>
            <span>Smart Attendance</span>
          </div>
        </div>

        <nav>
          <button className={`nav-item ${active === "dashboard" ? "active" : ""}`} onClick={() => setActive("dashboard")}>
            <span>▦</span> Dashboard
          </button>
          <button className={`nav-item ${active === "students" ? "active" : ""}`} onClick={() => setActive("students")}>
            <span>◉</span> Students
          </button>
          <button className={`nav-item ${active === "attendance" ? "active" : ""}`} onClick={() => setActive("attendance")}>
            <span>✓</span> Attendance
          </button>
          <button className={`nav-item ${active === "reports" ? "active" : ""}`} onClick={() => setActive("reports")}>
            <span>▤</span> Reports
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="profile">
            <div className="avatar">PF</div>
            <div>
              <strong>{session.user?.email || session.email || 'Professor'}</strong>
              <small>Professor</small>
            </div>
          </div>
          <div style={{ paddingTop: 10 }}>
            <button onClick={handleLogout} style={{ border: 0, background: 'transparent', color: '#ff7b7b' }}>Logout</button>
          </div>
        </div>
      </aside>
    );
  };

  return (
    <div className={`app ${session?.profile?.role === 'professor' ? 'with-sidebar' : ''}`}>
      <Background />
      <Nav />

      <ToastProvider>
        <main className="main">
          {!session && active === 'landing' && <Landing onNavigate={setActive} students={students} />}
          {!session && active === 'role-select' && <RoleSelection onNavigate={setActive} />}
          {!session && active === 'professor-login' && <ProfessorLogin onLogin={handleLogin} onBack={() => setActive('landing')} />}
          {!session && active === 'student-login' && <StudentLogin students={students} onLogin={handleLogin} onBack={() => setActive('landing')} />}

          {session && active === "dashboard" && (
            <RequireRole session={session} role="professor">
              <Dashboard students={students} attendance={attendance} setStudents={setStudentsWrapper} setAttendance={setAttendanceWrapper} goTo={(p) => setActive(p)} />
            </RequireRole>
          )}
          {session && active === "students" && (
            <RequireRole session={session} role="professor">
              <StudentsPage students={students} setStudents={setStudentsWrapper} attendance={attendance} setAttendance={setAttendanceWrapper} />
            </RequireRole>
          )}
          {session && active === "attendance" && (
            <RequireRole session={session} role="professor">
              <AttendancePage students={students} attendance={attendance} setAttendance={setAttendanceWrapper} />
            </RequireRole>
          )}
          {session && active === "reports" && (
            <RequireRole session={session} role="professor">
              <ReportsPage students={students} attendance={attendance} />
            </RequireRole>
          )}
          {session && active === 'student-dashboard' && (
            <RequireRole session={session} role="student">
              <StudentDashboard students={students} attendance={attendance} onLogout={handleLogout} session={session} />
            </RequireRole>
          )}

          {session && !['student-dashboard', 'dashboard', 'students', 'attendance', 'reports'].includes(active) && (
            <AccessDenied reason="forbidden" />
          )}
        </main>
      </ToastProvider>
    </div>
  );
}

export default App;
