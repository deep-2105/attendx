import { useEffect, useState } from "react";
import "./App.css";
import "./styles/public.css";
import "./styles/portal.css";
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
import auth from "./auth";
import supabase from './utils/supabase';

const ACTIVE_TO_PATH = {
  landing: '/',
  'role-select': '/role-select',
  'student-login': '/student/login',
  'professor-login': '/professor/login',
  'student-dashboard': '/student/dashboard',
  dashboard: '/professor/dashboard',
  students: '/professor/students',
  attendance: '/professor/attendance',
  reports: '/professor/reports',
};

function activeFromPath(pathname) {
  if (pathname === '/student/login') return 'student-login';
  if (pathname === '/professor/login') return 'professor-login';
  if (pathname === '/student/dashboard') return 'student-dashboard';
  if (pathname === '/professor/dashboard') return 'dashboard';
  if (pathname === '/professor/students') return 'students';
  if (pathname === '/professor/attendance') return 'attendance';
  if (pathname === '/professor/reports') return 'reports';
  if (pathname === '/role-select') return 'role-select';
  return 'landing';
}

function App() {
  const [active, setActive] = useState(() => {
    if (typeof window === 'undefined') return 'landing';
    return activeFromPath(window.location.pathname);
  });

  const [students, setStudents] = useState(() => loadStudents());
  const [attendance, setAttendance] = useState(() => loadAttendance());
  const [session, setSession] = useState(null);

  useEffect(() => {
    saveStudents(students);
  }, [students]);

  useEffect(() => {
    saveAttendance(attendance);
  }, [attendance]);

  // Sync with Supabase if configured: load remote data on mount and wrap setters to sync changes
  useEffect(()=>{
    let mounted = true;
    (async ()=>{
      if(!db.isSupabaseConfigured()) return;
      try{
        const s = await db.fetchStudents();
        const a = await db.fetchAttendance();
        if(!mounted) return;
        setStudents(s);
        setAttendance(a);
      }catch(e){
        console.warn('Supabase sync failed', e);
      }
    })();

    return ()=>{ mounted=false; };
  },[]);

  // wrapper setters that attempt to sync to Supabase when configured
  const setStudentsWrapper = (updater) => {
    setStudents((cur)=>{
      const next = typeof updater === 'function' ? updater(cur) : updater;
      (async ()=>{
        if(!db.isSupabaseConfigured()) return;
        // compute diffs
        const added = next.filter(n=>!cur.find(c=>c.id===n.id));
        const removed = cur.filter(c=>!next.find(n=>n.id===c.id));
        const maybeUpdated = next.filter(n=>cur.find(c=>c.id===n.id && JSON.stringify(c)!==JSON.stringify(n)));
        try{
          for(const r of added) await db.addStudent(r);
          for(const r of maybeUpdated) await db.updateStudent(r);
          for(const r of removed) await db.removeStudent(r.id);
        }catch(e){ console.warn('sync students error', e); }
      })();
      return next;
    });
  };

  const setAttendanceWrapper = (updater) => {
    setAttendance((cur)=>{
      const next = typeof updater === 'function' ? updater(cur) : updater;
      (async ()=>{
        if(!db.isSupabaseConfigured()) return;
        try{
          // naive approach: for any date present in next, upsert all records for that date
          for(const day of next){
            await db.upsertAttendanceRecordsForDate(day.date, day.records);
          }
        }catch(e){ console.warn('sync attendance error', e); }
      })();
      return next;
    });
  };

  const navigate = (next) => {
    setActive(next);
    if (typeof window === 'undefined') return;
    const target = ACTIVE_TO_PATH[next] || '/';
    if (window.location.pathname !== target) {
      window.history.pushState({}, '', target);
    }
  };

  function handleLogin(newSession) {
    setSession(newSession);
    navigate(newSession.profile && newSession.profile.role === 'professor' ? 'dashboard' : 'student-dashboard');
  }

  function handleLogout() {
    auth.signOut();
    setSession(null);
    navigate('landing');
  }

  // initialize session from Supabase
  useEffect(()=>{
    let mounted = true;
    (async ()=>{
      try{
        const s = await auth.getCurrentSession();
        if(!mounted) return;
        if(s){ setSession(s); navigate(s.profile?.role === 'professor' ? 'dashboard' : 'student-dashboard'); }
      }catch(e){ console.warn('failed to init session', e); }
    })();
    return ()=>{ mounted=false; };
  },[]);

  const professorSidebar = session && session.profile?.role === 'professor' ? (
    <aside className="ax-prof-sidebar">
      <div className="ax-prof-brand">
        <div className="ax-prof-brand-icon">A</div>
        <div>
          <h2>AttendX</h2>
          <span>Smart Attendance. Smarter Decisions.</span>
        </div>
      </div>

      <nav className="ax-prof-nav">
        <button className={`ax-prof-nav-item ${active === "dashboard" ? "active" : ""}`} onClick={() => navigate("dashboard")}>
          <span>▦</span>
          Dashboard
        </button>

        <button className={`ax-prof-nav-item ${active === "students" ? "active" : ""}`} onClick={() => navigate("students")}>
          <span>◉</span>
          Students
        </button>

        <button className={`ax-prof-nav-item ${active === "attendance" ? "active" : ""}`} onClick={() => navigate("attendance")}>
          <span>✓</span>
          Attendance
        </button>

        <button className={`ax-prof-nav-item ${active === "reports" ? "active" : ""}`} onClick={() => navigate("reports")}>
          <span>▤</span>
          Reports
        </button>

        <span className="ax-prof-nav-item muted"><span>◌</span>Analytics</span>
        <span className="ax-prof-nav-item muted"><span>⚙</span>Settings</span>
      </nav>

      <div className="ax-prof-sidebar-bottom">
        <div className="ax-prof-profile">
          <div className="ax-prof-avatar">PF</div>
          <div>
            <strong>{session.email || 'Professor'}</strong>
            <small>Computer Science</small>
          </div>
        </div>
        <div className="ax-prof-logout-wrap">
          <button className="ax-prof-logout" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </aside>
  ) : null;

  useEffect(()=>{
    // initialize session from Supabase if present
    let mounted = true;
    (async ()=>{
      const s = await auth.getCurrentSession();
      if(mounted && s) setSession(s);
    })();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      // when auth state changes, try to refresh profile
      (async ()=>{
        const s = await auth.getCurrentSession();
        setSession(s);
      })();
    });

    return ()=>{ mounted=false; listener?.subscription?.unsubscribe?.(); };
  },[]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onPop = () => setActive(activeFromPath(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return (
    <div className={`app ${session && session.profile && session.profile.role === 'professor' ? 'with-sidebar' : ''}`}>
      {professorSidebar}

      <ToastProvider>
      <main className="main">
        {(!session && active === 'landing') && (
          <Landing onNavigate={navigate} students={students} />
        )}

        {(!session && active === 'role-select') && (
          <RoleSelection onNavigate={navigate} />
        )}

        {(!session && active === 'professor-login') && (
          <ProfessorLogin onLogin={handleLogin} onBack={()=>navigate('role-select')} />
        )}

        {(!session && active === 'student-login') && (
          <StudentLogin students={students} onLogin={handleLogin} onBack={()=>navigate('role-select')} />
        )}

        {!session && ['student-dashboard', 'dashboard', 'students', 'attendance', 'reports'].includes(active) && (
          <AccessDenied reason="not-authenticated" />
        )}

        {session && active === "dashboard" && (
          <RequireRole session={session} role="professor">
            <Dashboard
              students={students}
              attendance={attendance}
              setStudents={setStudentsWrapper}
              setAttendance={setAttendanceWrapper}
              goTo={navigate}
            />
          </RequireRole>
        )}

        {session && active === "students" && (
          <RequireRole session={session} role="professor">
            <StudentsPage
              students={students}
              setStudents={setStudentsWrapper}
              attendance={attendance}
              setAttendance={setAttendanceWrapper}
            />
          </RequireRole>
        )}

        {session && active === "attendance" && (
          <RequireRole session={session} role="professor">
            <AttendancePage
              students={students}
              attendance={attendance}
              setAttendance={setAttendanceWrapper}
            />
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
        {/* Fallback access denied when session exists but no matching view is allowed */}
        {session && !['student-dashboard','dashboard','students','attendance','reports'].includes(active) && (
          <AccessDenied reason="forbidden" />
        )}
      </main>
      </ToastProvider>
    </div>
  );
}

export default App;