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
import ProfessorAnalytics from "./pages/ProfessorAnalytics";
import ProfessorSettings from "./pages/ProfessorSettings";
import RequireRole, {
  AUTH_LOADING,
  UNAUTHENTICATED,
  AUTHENTICATED_ROLE_LOADING,
  AUTHENTICATED_ROLE_RESOLVED,
} from './components/RequireRole';
import AccessDenied from './components/AccessDenied';
import auth from "./auth";
import supabase from './utils/supabase';

const ACTIVE_TO_PATH = {
  landing: '/',
  'role-select': '/role-select',
  'student-login': '/student/login',
  'professor-login': '/professor/login',
  'student-dashboard': '/student/dashboard',
  'student-subjects': '/student/subjects',
  'student-attendance': '/student/attendance',
  'student-analytics': '/student/analytics',
  'student-profile': '/student/profile',
  dashboard: '/professor/dashboard',
  students: '/professor/students',
  attendance: '/professor/attendance',
  reports: '/professor/reports',
  analytics: '/professor/analytics',
  settings: '/professor/settings',
};

function activeFromPath(pathname) {
  if (pathname === '/student/login') return 'student-login';
  if (pathname === '/professor/login') return 'professor-login';
  if (pathname === '/student/dashboard') return 'student-dashboard';
  if (pathname === '/student/subjects') return 'student-subjects';
  if (pathname === '/student/attendance') return 'student-attendance';
  if (pathname === '/student/analytics') return 'student-analytics';
  if (pathname === '/student/profile') return 'student-profile';
  if (pathname === '/professor/dashboard') return 'dashboard';
  if (pathname === '/professor/students') return 'students';
  if (pathname === '/professor/attendance') return 'attendance';
  if (pathname === '/professor/reports') return 'reports';
  if (pathname === '/professor/analytics') return 'analytics';
  if (pathname === '/professor/settings') return 'settings';
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
  const [authState, setAuthState] = useState(AUTH_LOADING);

  const authLoading = authState === AUTH_LOADING;
  const roleLoading = authState === AUTHENTICATED_ROLE_LOADING;

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
    if (!newSession || !newSession.profile) {
      setSession(null);
      setAuthState(UNAUTHENTICATED);
      return;
    }

    setSession(newSession);
    setAuthState(AUTHENTICATED_ROLE_RESOLVED);
    navigate(newSession.profile.role === 'professor' ? 'dashboard' : 'student-dashboard');
  }

  function handleLogout() {
    auth.signOut();
    setSession(null);
    setAuthState(UNAUTHENTICATED);
    navigate('landing');
  }

  useEffect(() => {
    let mounted = true;

    const hydrateSession = async () => {
      setAuthState(AUTH_LOADING);
      try {
        const restoredSession = await auth.getCurrentSession();
        if (!mounted) return;

        if (!restoredSession) {
          setSession(null);
          setAuthState(UNAUTHENTICATED);
          return;
        }

        setSession(restoredSession);
        setAuthState(restoredSession.profile ? AUTHENTICATED_ROLE_RESOLVED : AUTHENTICATED_ROLE_LOADING);

        if (restoredSession.profile) {
          navigate(restoredSession.profile.role === 'professor' ? 'dashboard' : 'student-dashboard');
          const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
          const currentActive = activeFromPath(currentPath);
          const professorRoutes = ['dashboard', 'students', 'attendance', 'reports', 'analytics', 'settings'];
          const studentRoutesList = ['student-dashboard', 'student-subjects', 'student-attendance', 'student-analytics', 'student-profile'];
          const validRoutes = restoredSession.profile.role === 'professor' ? professorRoutes : studentRoutesList;

          if (!validRoutes.includes(currentActive)) {
            navigate(restoredSession.profile.role === 'professor' ? 'dashboard' : 'student-dashboard');
          }
        }
      } catch (e) {
        if (mounted) {
          setSession(null);
          setAuthState(UNAUTHENTICATED);
        }
        console.warn('failed to init session', e);
      }
    };

    hydrateSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, supabaseSession) => {
      if (!mounted) return;

      if (!supabaseSession) {
        setSession(null);
        setAuthState(UNAUTHENTICATED);
        return;
      }

      setAuthState(AUTHENTICATED_ROLE_LOADING);

      try {
        const nextSession = await auth.getCurrentSession();
        if (!mounted) return;

        if (!nextSession) {
          setSession(null);
          setAuthState(UNAUTHENTICATED);
          return;
        }

        setSession(nextSession);
        setAuthState(nextSession.profile ? AUTHENTICATED_ROLE_RESOLVED : AUTHENTICATED_ROLE_LOADING);

        if (nextSession?.profile) {
          const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
          const currentActive = activeFromPath(currentPath);
          const professorRoutes = ['dashboard', 'students', 'attendance', 'reports', 'analytics', 'settings'];
          const studentRoutesList = ['student-dashboard', 'student-subjects', 'student-attendance', 'student-analytics', 'student-profile'];
          const validRoutes = nextSession.profile.role === 'professor' ? professorRoutes : studentRoutesList;

          if (!validRoutes.includes(currentActive)) {
            navigate(nextSession.profile.role === 'professor' ? 'dashboard' : 'student-dashboard');
          }
        }
      } catch (e) {
        if (!mounted) return;
        setSession(null);
        setAuthState(UNAUTHENTICATED);
        console.warn('failed to resolve auth state', e);
      }
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  const sessionRole = session?.profile?.role;
  const authRoutes = ['landing', 'role-select', 'student-login', 'professor-login'];
  const studentRoutes = ['student-dashboard', 'student-subjects', 'student-attendance', 'student-analytics', 'student-profile'];
  const allowedSessionRoutes = sessionRole === 'professor'
    ? ['dashboard', 'students', 'attendance', 'reports', 'analytics', 'settings']
    : sessionRole === 'student'
      ? studentRoutes
      : [];

  const shouldShowAccessDenied =
    !!session &&
    !!session.profile &&
    authState === AUTHENTICATED_ROLE_RESOLVED &&
    !authRoutes.includes(active) &&
    !allowedSessionRoutes.includes(active);

  const professorSidebar = session && session.profile?.role === 'professor' ? (
    <aside className="ax-prof-sidebar" aria-label="Professor sidebar">
      <div className="ax-prof-brand">
        <div className="ax-prof-brand-icon">A</div>
        <div>
          <h2>AttendX</h2>
          <span>Smart Attendance. Smarter Decisions.</span>
        </div>
      </div>

      <nav className="ax-prof-nav" aria-label="Professor navigation">
        {[
          { key: 'dashboard', label: 'Dashboard', icon: '▦' },
          { key: 'students', label: 'Students', icon: '◉' },
          { key: 'attendance', label: 'Attendance', icon: '✓' },
          { key: 'reports', label: 'Reports', icon: '▤' },
          { key: 'analytics', label: 'Analytics', icon: '◌' },
          { key: 'settings', label: 'Settings', icon: '⚙' },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            className={`ax-prof-nav-item ${active === item.key ? 'active' : ''}`}
            onClick={() => navigate(item.key)}
            aria-current={active === item.key ? 'page' : undefined}
          >
            <span className="ax-nav-icon" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="ax-prof-sidebar-bottom">
        <div className="ax-prof-profile">
          <div className="ax-prof-avatar">{(session.profile?.full_name || session.profile?.name || 'P').charAt(0).toUpperCase()}</div>
          <div>
            <strong>{session.profile?.full_name || session.profile?.name || 'Professor'}</strong>
            <small>{session.profile?.department || 'Computer Science'}</small>
          </div>
        </div>
        <div className="ax-prof-logout-wrap">
          <button type="button" className="ax-prof-logout" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </aside>
  ) : null;

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
        {authState === AUTH_LOADING && (
          <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em' }}>AttendX</div>
              <p style={{ margin: '10px 0 0', color: '#9aa3c7' }}>Checking your session...</p>
            </div>
          </div>
        )}

        {authState === UNAUTHENTICATED && active === 'landing' && (
          <Landing onNavigate={navigate} students={students} />
        )}

        {authState === UNAUTHENTICATED && active === 'role-select' && (
          <RoleSelection onNavigate={navigate} />
        )}

        {authState === UNAUTHENTICATED && active === 'professor-login' && (
          <ProfessorLogin onLogin={handleLogin} onBack={()=>navigate('role-select')} />
        )}

        {authState === UNAUTHENTICATED && active === 'student-login' && (
          <StudentLogin students={students} onLogin={handleLogin} onBack={()=>navigate('role-select')} />
        )}

        {authState === UNAUTHENTICATED && active === 'student-dashboard' && (
          <StudentLogin students={students} onLogin={handleLogin} onBack={()=>navigate('role-select')} />
        )}

        {authState === UNAUTHENTICATED && ['dashboard', 'students', 'attendance', 'reports'].includes(active) && (
          <ProfessorLogin onLogin={handleLogin} onBack={()=>navigate('role-select')} />
        )}

        {session && active === "dashboard" && (
          <RequireRole
            session={session}
            role="professor"
            authLoading={authLoading}
            roleLoading={roleLoading}
            authState={authState}
          >
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
          <RequireRole
            session={session}
            role="professor"
            authLoading={authLoading}
            roleLoading={roleLoading}
            authState={authState}
          >
            <StudentsPage
              students={students}
              setStudents={setStudentsWrapper}
              attendance={attendance}
              setAttendance={setAttendanceWrapper}
            />
          </RequireRole>
        )}

        {session && active === "attendance" && (
          <RequireRole
            session={session}
            role="professor"
            authLoading={authLoading}
            roleLoading={roleLoading}
            authState={authState}
          >
            <AttendancePage
              students={students}
              attendance={attendance}
              setAttendance={setAttendanceWrapper}
            />
          </RequireRole>
        )}

        {session && active === "reports" && (
          <RequireRole
            session={session}
            role="professor"
            authLoading={authLoading}
            roleLoading={roleLoading}
            authState={authState}
          >
            <ReportsPage students={students} attendance={attendance} />
          </RequireRole>
        )}

        {session && active === "analytics" && (
          <RequireRole
            session={session}
            role="professor"
            authLoading={authLoading}
            roleLoading={roleLoading}
            authState={authState}
          >
            <ProfessorAnalytics students={students} attendance={attendance} />
          </RequireRole>
        )}

        {session && active === "settings" && (
          <RequireRole
            session={session}
            role="professor"
            authLoading={authLoading}
            roleLoading={roleLoading}
            authState={authState}
          >
            <ProfessorSettings session={session} />
          </RequireRole>
        )}

        {session && studentRoutes.includes(active) && (
          <RequireRole
            session={session}
            role="student"
            authLoading={authLoading}
            roleLoading={roleLoading}
            authState={authState}
          >
            <StudentDashboard
              students={students}
              attendance={attendance}
              onLogout={handleLogout}
              session={session}
              view={active}
              onNavigate={navigate}
            />
          </RequireRole>
        )}
        {/* Genuine access denials only after auth/role resolution is complete and the route is not in the user's valid route set. */}
        {shouldShowAccessDenied && (
          <AccessDenied reason="forbidden" />
        )}
      </main>
      </ToastProvider>
    </div>
  );
}

export default App;