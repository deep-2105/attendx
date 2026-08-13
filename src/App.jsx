import { useMemo, useState } from "react";
import "./App.css";

const initialStudents = [
  { id: 1, name: "Aarav Sharma", roll: "BCA001", present: true },
  { id: 2, name: "Ananya Singh", roll: "BCA002", present: true },
  { id: 3, name: "Rohan Verma", roll: "BCA003", present: false },
  { id: 4, name: "Priya Gupta", roll: "BCA004", present: true },
  { id: 5, name: "Aditya Kumar", roll: "BCA005", present: false },
  { id: 6, name: "Sneha Mehta", roll: "BCA006", present: true },
];

function App() {
  const [students, setStudents] = useState(initialStudents);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRoll, setNewRoll] = useState("");

  const filteredStudents = useMemo(() => {
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.roll.toLowerCase().includes(search.toLowerCase())
    );
  }, [students, search]);

  const presentCount = students.filter((student) => student.present).length;
  const absentCount = students.length - presentCount;
  const attendancePercentage = students.length
    ? Math.round((presentCount / students.length) * 100)
    : 0;

  const toggleAttendance = (id) => {
    setStudents((current) =>
      current.map((student) =>
        student.id === id
          ? { ...student, present: !student.present }
          : student
      )
    );
  };

  const addStudent = (e) => {
    e.preventDefault();

    if (!newName.trim() || !newRoll.trim()) return;

    setStudents((current) => [
      ...current,
      {
        id: Date.now(),
        name: newName.trim(),
        roll: newRoll.trim(),
        present: false,
      },
    ]);

    setNewName("");
    setNewRoll("");
    setShowAdd(false);
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">A</div>
          <div>
            <h2>AttendX</h2>
            <span>Smart Attendance</span>
          </div>
        </div>

        <nav>
          <button className="nav-item active">
            <span>▦</span>
            Dashboard
          </button>

          <button className="nav-item">
            <span>◉</span>
            Students
          </button>

          <button className="nav-item">
            <span>✓</span>
            Attendance
          </button>

          <button className="nav-item">
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

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">ATTENDANCE MANAGEMENT</p>
            <h1>Good morning 👋</h1>
            <p className="subtitle">
              Manage today's attendance from one place.
            </p>
          </div>

          <div className="date-box">
            <span>Today</span>
            <strong>
              {new Date().toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </strong>
          </div>
        </header>

        <section className="stats">
          <div className="stat-card">
            <div className="stat-icon blue">◉</div>
            <div>
              <span>Total Students</span>
              <strong>{students.length}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">✓</div>
            <div>
              <span>Present Today</span>
              <strong>{presentCount}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon red">×</div>
            <div>
              <span>Absent Today</span>
              <strong>{absentCount}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">%</div>
            <div>
              <span>Attendance Rate</span>
              <strong>{attendancePercentage}%</strong>
            </div>
          </div>
        </section>

        <section className="content-card">
          <div className="section-header">
            <div>
              <h2>Today's Attendance</h2>
              <p>Mark students as present or absent.</p>
            </div>

            <button
              className="add-button"
              onClick={() => setShowAdd(!showAdd)}
            >
              + Add Student
            </button>
          </div>

          {showAdd && (
            <form className="add-form" onSubmit={addStudent}>
              <input
                type="text"
                placeholder="Student name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />

              <input
                type="text"
                placeholder="Roll number"
                value={newRoll}
                onChange={(e) => setNewRoll(e.target.value)}
              />

              <button type="submit">Add</button>
            </form>
          )}

          <div className="toolbar">
            <div className="search">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Search student or roll number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="summary">
              <span className="dot green-dot"></span>
              {presentCount} Present
              <span className="dot red-dot"></span>
              {absentCount} Absent
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll Number</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className="student">
                        <div className="student-avatar">
                          {student.name.charAt(0)}
                        </div>

                        <div>
                          <strong>{student.name}</strong>
                          <small>Student</small>
                        </div>
                      </div>
                    </td>

                    <td>{student.roll}</td>

                    <td>
                      <span
                        className={
                          student.present
                            ? "status present"
                            : "status absent"
                        }
                      >
                        {student.present ? "● Present" : "● Absent"}
                      </span>
                    </td>

                    <td>
                      <button
                        className={
                          student.present
                            ? "attendance-btn mark-absent"
                            : "attendance-btn mark-present"
                        }
                        onClick={() => toggleAttendance(student.id)}
                      >
                        {student.present ? "Mark Absent" : "Mark Present"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredStudents.length === 0 && (
              <div className="empty">
                <div>🔎</div>
                <h3>No students found</h3>
                <p>Try searching with another name or roll number.</p>
              </div>
            )}
          </div>
        </section>

        <footer>
          <span>AttendX</span>
          <span>Smart Attendance Management System</span>
        </footer>
      </main>
    </div>
  );
}

export default App;