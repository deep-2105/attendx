import { useEffect, useState } from "react";
import "./App.css";
import { ToastProvider } from "./components/Toast";

import { loadStudents, saveStudents, loadAttendance, saveAttendance } from "./storage";

import Dashboard from "./pages/Dashboard";
import StudentsPage from "./pages/Students";
import AttendancePage from "./pages/Attendance";
import ReportsPage from "./pages/Reports";

function App() {
  const [active, setActive] = useState("dashboard");

  const [students, setStudents] = useState(() => loadStudents());
  const [attendance, setAttendance] = useState(() => loadAttendance());

  useEffect(() => {
    saveStudents(students);
  }, [students]);

  useEffect(() => {
    saveAttendance(attendance);
  }, [attendance]);

  // navigation click handler
  const Nav = () => (
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
          <div className="avatar">DS</div>
          <div>
            <strong>Admin</strong>
            <small>Administrator</small>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="app">
      <Nav />

      <ToastProvider>
      <main className="main">
        {active === "dashboard" && (
          <Dashboard
            students={students}
            attendance={attendance}
            setStudents={setStudents}
            setAttendance={setAttendance}
            goTo={(p) => setActive(p)}
          />
        )}

        {active === "students" && (
          <StudentsPage
            students={students}
            setStudents={setStudents}
            attendance={attendance}
            setAttendance={setAttendance}
          />
        )}

        {active === "attendance" && (
          <AttendancePage
            students={students}
            attendance={attendance}
            setAttendance={setAttendance}
          />
        )}

        {active === "reports" && (
          <ReportsPage students={students} attendance={attendance} />
        )}
      </main>
      </ToastProvider>
    </div>
  );
}

export default App;