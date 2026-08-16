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

  function handleLogin(newSession) {
    setSession(newSession);
    setActive(newSession.profile && newSession.profile.role === 'professor' ? 'dashboard' : 'student-dashboard');
  }

  function handleLogout() {
    auth.signOut();
    setSession(null);
    setActive('landing');
  }

  // initialize session from Supabase
  useEffect(()=>{
    let mounted = true;
    (async ()=>{
      try{
        const s = await auth.getCurrentSession();
        if(!mounted) return;
        if(s){ setSession(s); setActive(s.profile?.role === 'professor' ? 'dashboard' : 'student-dashboard'); }
      }catch(e){ console.warn('failed to init session', e); }
    })();
    return ()=>{ mounted=false; };
  },[]);

  // navigation click handler
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
            <span>▦</span>
            Dashboard
          </button>

          <button className={`nav-item ${active === "students" ? "active" : ""}`} onClick={() => setActive("students")}>
            <span>◉</span>
            Students
          </button>

          <button className={`nav-item ${active === "attendance" ? "active" : ""}`} onClick={() => setActive("attendance")}>
            <span>✓</span>
            Attendance
          </button>

          <button className={`nav-item ${active === "reports" ? "active" : ""}`} onClick={() => setActive("reports")}>
            <span>▤</span>
            Reports
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="profile">
            <div className="avatar">PF</div>
            <div>
              <strong>{session.email || 'Professor'}</strong>
              <small>Professor</small>
            </div>
          </div>
          <div style={{paddingTop:10}}>
            <button onClick={handleLogout} style={{border:0,background:'transparent',color:'#ff7b7b'}}>Logout</button>
          </div>
        </div>
      </aside>
    );
  };

  useEffect(()=>{
    // initialize session from Supabase if present
    let mounted = true;
    (async ()=>{
      const s = await auth.getCurrentSession();
      if(mounted && s) setSession(s);
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((event, sbSession) => {
      // when auth state changes, try to refresh profile
      (async ()=>{
        const s = await auth.getCurrentSession();
        setSession(s);
      })();
    });

    return ()=>{ mounted=false; listener?.subscription?.unsubscribe?.(); };
  },[]);

  return (
    <div className={`app ${session && session.profile && session.profile.role === 'professor' ? 'with-sidebar' : ''}`}>
      <Background />
      <Nav />

      <ToastProvider>
      <main className="main">
        {(!session && active === 'landing') && (
          <Landing onNavigate={setActive} students={students} />
        )}

        {(!session && active === 'role-select') && (
          <RoleSelection onNavigate={setActive} />
        )}

        {(!session && active === 'professor-login') && (
          <ProfessorLogin onLogin={handleLogin} onBack={()=>setActive('landing')} />
        )}

        {(!session && active === 'student-login') && (
          <StudentLogin students={students} onLogin={handleLogin} onBack={()=>setActive('landing')} />
        )}

        {session && active === "dashboard" && (
          <RequireRole session={session} role="professor">
            <Dashboard
              students={students}
              attendance={attendance}
              setStudents={setStudentsWrapper}
              setAttendance={setAttendanceWrapper}
              goTo={(p) => setActive(p)}
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