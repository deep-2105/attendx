import React, { useMemo, useState } from "react";
import { formatDate } from "../storage";
import CanIBunk from "../components/CanIBunk";
import { useToast } from "../components/Toast";
import { computeStudentOverall } from "../utils/attendance";
import StatCard from '../components/ui/StatCard';

export default function Dashboard({ students, attendance, setAttendance, goTo }) {
  const today = formatDate();
  const todayRecord = attendance.find((a) => a.date === today) || { records: [] };

  const presentCount = todayRecord.records.filter((r) => r.present).length;
  const total = students.length;
  const absentCount = total - presentCount;
  const attendancePercentage = total ? Math.round((presentCount / total) * 100) : 0;

  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.roll.toLowerCase().includes(q)
    );
  }, [students, search]);

  const toast = useToast();

  const toggleStudent = (id) => {
    const before = computeStudentOverall(id, students, attendance);
    // simulate new attendance array
    const newAttendance = attendance.slice();
    let rec = newAttendance.find((r) => r.date === today);
    if (!rec) {
      rec = { date: today, records: [] };
      newAttendance.push(rec);
    }
    const existing = rec.records.find((r) => r.studentId === id);
    if (existing) existing.present = !existing.present;
    else rec.records.push({ studentId: id, present: true });

    setAttendance(newAttendance);

    const after = computeStudentOverall(id, students, newAttendance);

    // small randomized messages
    const messagesPresent = ["Attendance secured.", "Nice. Future-you approves."];
    const messagesAbsent = ["Another one bites the attendance percentage.", "Your attendance just felt that."];
    const msgList = after.pct >= before.pct ? messagesPresent : messagesAbsent;
    toast.show(msgList[Math.floor(Math.random()*msgList.length)]);

    // smart moments
    if (before.pct < 75 && after.pct >= 75) toast.show("75% unlocked. You're safe.");
    if (before.pct >= 75 && after.pct < 75) toast.show("Uh oh. Attendance alert.");
    if (after.pct >= 90 && before.pct < 90) toast.show("90% club unlocked.");
    if (after.pct === 100 && before.pct < 100) toast.show("Perfect attendance. Respect.");
  };

  const markAll = (present) => {
    setAttendance((cur) => {
      const copy = [...cur];
      let rec = copy.find((r) => r.date === today);
      if (!rec) {
        rec = { date: today, records: [] };
        copy.push(rec);
      }
      rec.records = students.map((s) => ({ studentId: s.id, present }));
      return copy;
    });
  };

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">ATTENDANCE MANAGEMENT</p>
          <h1>Dashboard</h1>
          <p className="subtitle">Overview of today's attendance.</p>
        </div>

        <div className="date-box">
          <span>Today</span>
          <strong>{today}</strong>
        </div>
      </header>

        <section className="stats">
          <StatCard title="Total Students" value={total} icon={'◉'} />
          <StatCard title="Present Today" value={presentCount} icon={'✓'} />
          <StatCard title="Absent Today" value={absentCount} icon={'×'} />
          <StatCard title="Attendance Rate" value={`${attendancePercentage}%`} icon={'%'} />
        </section>

          <section style={{marginTop:18}}>
            <CanIBunk students={students} attendance={attendance} />
          </section>

      <section className="content-card">
        <div className="section-header">
          <div>
            <h2>Today's Attendance</h2>
            <p>Quick actions and list.</p>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button className="add-button" onClick={() => goTo("students")}>Manage Students</button>
            <button className="add-button" onClick={() => markAll(true)}>Mark All Present</button>
            <button className="add-button" onClick={() => markAll(false)}>Mark All Absent</button>
          </div>
        </div>

        <div className="toolbar">
          <div className="search">
            <span>⌕</span>
            <input placeholder="Search student or roll number..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
              {filtered.map((s) => {
                const r = todayRecord.records.find((rec) => rec.studentId === s.id);
                const present = !!r && r.present;
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
                      <span className={present ? "status present" : "status absent"}>
                        {present ? "● Present" : "● Absent"}
                      </span>
                    </td>

                    <td>
                      <button className={present ? "attendance-btn mark-absent" : "attendance-btn mark-present"} onClick={() => toggleStudent(s.id)}>
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
