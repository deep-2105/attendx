import { useMemo, useState } from "react";
import { formatDate } from "../storage";
import AttendanceStatus from "../components/AttendanceStatus";

export default function StudentsPage({ students, setStudents, attendance, setAttendance }) {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [roll, setRoll] = useState("");
  const [editId, setEditId] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.roll.toLowerCase().includes(q)
    );
  }, [students, search]);

  const resetForm = () => {
    setName("");
    setRoll("");
    setEditId(null);
    setShowAdd(false);
  };

  const validate = () => {
    if (!name.trim()) return "Name is required";
    if (!roll.trim()) return "Roll is required";
    const dup = students.find((s) => s.roll.toLowerCase() === roll.trim().toLowerCase() && s.id !== editId);
    if (dup) return "Duplicate roll number";
    return null;
  };

  const submit = (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return alert(err);

    if (editId) {
      setStudents((cur) => cur.map((s) => (s.id === editId ? { ...s, name: name.trim(), roll: roll.trim() } : s)));
      resetForm();
      return;
    }

    setStudents((cur) => [...cur, { id: Date.now(), name: name.trim(), roll: roll.trim() }]);
    resetForm();
  };

  const startEdit = (s) => {
    setEditId(s.id);
    setName(s.name);
    setRoll(s.roll);
    setShowAdd(true);
  };

  const del = (s) => {
    if (!confirm(`Delete student ${s.name}? This will remove attendance records for this student.`)) return;
    setStudents((cur) => cur.filter((x) => x.id !== s.id));
    setAttendance((cur) => cur.map((day) => ({ ...day, records: day.records.filter((r) => r.studentId !== s.id) })));
  };

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">STUDENTS</p>
          <h1>Students</h1>
          <p className="subtitle">Manage student records.</p>
        </div>

        <div className="date-box">
          <span>Last update</span>
          <strong>{formatDate()}</strong>
        </div>
      </header>

      <section className="content-card">
        <div className="section-header">
          <div>
            <h2>Students</h2>
            <p>All registered students.</p>
          </div>

          <button className="add-button" onClick={() => { setShowAdd((s) => !s); resetForm(); }}>
            + Add Student
          </button>
        </div>

        {showAdd && (
          <form className="add-form" onSubmit={submit}>
            <input placeholder="Student name" value={name} onChange={(e) => setName(e.target.value)} />
            <input placeholder="Roll number" value={roll} onChange={(e) => setRoll(e.target.value)} />
            <button type="submit">{editId ? "Save" : "Add"}</button>
          </form>
        )}

        <div className="toolbar">
          <div className="search">
            <span>⌕</span>
            <input placeholder="Search student or roll number..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <div className="summary">
            <span className="dot green-dot"></span>
            {students.length} Students
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll Number</th>
                <th>Attendance %</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((s) => {
                // compute stats
                const totalDays = attendance.length;
                const present = attendance.reduce((acc, day) => acc + (day.records.find((r) => r.studentId === s.id && r.present) ? 1 : 0), 0);
                const percent = totalDays ? Math.round((present / totalDays) * 100) : 0;
                return (
                  <tr key={s.id}>
                    <td>
                      <div className="student">
                        <div className="student-avatar">{s.name.charAt(0)}</div>
                        <div>
                          <strong>{s.name}</strong>
                          <small>Student</small>
                        </div>
                      </div>
                    </td>

                    <td>{s.roll}</td>

                    <td style={{display:'flex',gap:8,alignItems:'center'}}><AttendanceStatus pct={percent} /> <span>{percent}% ({present}/{totalDays})</span></td>

                    <td>
                      <button className="attendance-btn" onClick={() => startEdit(s)}>Edit</button>
                      <button className="attendance-btn mark-absent" onClick={() => del(s)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <footer>
        <span>AttendX</span>
        <span>Smart Attendance Management System</span>
      </footer>
    </>
  );
}
