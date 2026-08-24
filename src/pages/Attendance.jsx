import React, { useMemo, useState } from "react";
import { formatDate } from "../storage";
import { useToast } from "../components/Toast";
import { computeStudentOverall } from "../utils/attendance";

export default function AttendancePage({ students, attendance, setAttendance }) {
  const [date, setDate] = useState(formatDate());
  const toast = useToast();

  const dayRecord = attendance.find((d) => d.date === date) || { date, records: [] };

  const getPresent = (id) => !!dayRecord.records.find((r) => r.studentId === id && r.present);

  const toggle = (id) => {
    const before = computeStudentOverall(id, students, attendance);
    const newAttendance = attendance.slice();
    let rec = newAttendance.find((r) => r.date === date);
    if (!rec) {
      rec = { date, records: [] };
      newAttendance.push(rec);
    }
    const existing = rec.records.find((r) => r.studentId === id);
    if (existing) existing.present = !existing.present;
    else rec.records.push({ studentId: id, present: true });
    setAttendance(newAttendance);
    const after = computeStudentOverall(id, students, newAttendance);
    try { toast.show(after.pct >= before.pct ? 'Attendance secured.' : 'Attendance updated.'); } catch(e){}
  };

  const markAll = (present) => {
    const newAttendance = attendance.slice();
    let rec = newAttendance.find((r) => r.date === date);
    if (!rec) {
      rec = { date, records: [] };
      newAttendance.push(rec);
    }
    rec.records = students.map((s) => ({ studentId: s.id, present }));
    setAttendance(newAttendance);
    try { toast.show(present ? 'Marked all present.' : 'Marked all absent.'); } catch(e){}
  };

  const summary = useMemo(() => {
    const total = students.length;
    const present = (dayRecord.records || []).filter((r) => r.present).length;
    const absent = total - present;
    const pct = total ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, pct };
  }, [students, dayRecord]);

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">ATTENDANCE</p>
          <h1>Attendance</h1>
          <p className="subtitle">Mark attendance for a selected date.</p>
        </div>

        <div className="date-box">
          <span>Select Date</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </header>

      <section className="stats">
        <div className="stat-card">
          <div className="stat-icon blue">◉</div>
          <div>
            <span>Total Students</span>
            <strong>{summary.total}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">✓</div>
          <div>
            <span>Present</span>
            <strong>{summary.present}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">×</div>
          <div>
            <span>Absent</span>
            <strong>{summary.absent}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">%</div>
          <div>
            <span>Attendance %</span>
            <strong>{summary.pct}%</strong>
          </div>
        </div>
      </section>

      <section className="content-card">
        <div className="section-header">
          <div>
            <h2>Mark Attendance</h2>
            <p>Click to toggle present/absent for each student.</p>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button className="add-button" onClick={() => markAll(true)}>Mark All Present</button>
            <button className="add-button" onClick={() => markAll(false)}>Mark All Absent</button>
          </div>
        </div>

        <div className="toolbar">
          <div className="summary">
            <span className="dot green-dot"></span>
            {summary.present} Present
            <span className="dot red-dot"></span>
            {summary.absent} Absent
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
              {students.map((s) => {
                const present = getPresent(s.id);
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

                    <td>
                      <span className={present ? "status present" : "status absent"}>{present ? "● Present" : "● Absent"}</span>
                    </td>

                    <td>
                      <button className={present ? "attendance-btn mark-absent" : "attendance-btn mark-present"} onClick={() => toggle(s.id)}>
                        {present ? "Mark Absent" : "Mark Present"}
                      </button>
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
