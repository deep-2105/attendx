import { formatDate } from "../storage";

function parseDateISO(s) {
  return new Date(s + "T00:00:00");
}

export function filterAttendanceByRange(attendance, range) {
  // range: { type: 'today'|'week'|'month'|'all', from: Date, to: Date }
  if (!attendance) return [];
  if (range.type === "all") return attendance.slice().sort((a,b)=>a.date.localeCompare(b.date));
  const from = formatDate(range.from);
  const to = formatDate(range.to);
  return attendance.filter(d => d.date >= from && d.date <= to).sort((a,b)=>a.date.localeCompare(b.date));
}

export function attendanceTrend(attendanceFiltered) {
  // returns array of {date, presentCount, absentCount}
  return attendanceFiltered.map(day => {
    const present = (day.records || []).filter(r=>r.present).length;
    const absent = (day.records || []).length - present;
    return { date: day.date, present, absent };
  });
}

export function presentAbsentTotals(attendanceFiltered, studentsCount) {
  // for filtered period, sum present/absent across days and compute last-day present/absent
  const totals = attendanceFiltered.reduce((acc,day)=>{
    const present = (day.records||[]).filter(r=>r.present).length;
    acc.present += present;
    acc.absent += ((day.records||[]).length - present);
    return acc;
  }, { present:0, absent:0 });
  // last day snapshot
  const last = attendanceFiltered.length ? attendanceFiltered[attendanceFiltered.length-1] : null;
  const lastPresent = last ? (last.records||[]).filter(r=>r.present).length : 0;
  const lastAbsent = last ? ((last.records||[]).length - lastPresent) : studentsCount - lastPresent;
  return { totals, last: { present: lastPresent, absent: lastAbsent } };
}

export function studentStats(students, attendanceFiltered) {
  // returns array of {id,name,roll,totalDays,presentCount,absentCount,percentage}
  const totalDays = attendanceFiltered.length;
  return students.map(s => {
    const present = attendanceFiltered.reduce((acc,day)=> acc + ((day.records||[]).find(r=>r.studentId===s.id && r.present) ? 1 : 0), 0);
    const absent = totalDays - present;
    const pct = totalDays ? Math.round((present/totalDays)*100) : 0;
    return { id: s.id, name: s.name, roll: s.roll, totalDays, present, absent, pct };
  });
}

export function bestAndWorst(stats) {
  if (!stats || !stats.length) return { best: null, worst: null };
  const sorted = [...stats].sort((a,b)=> b.pct - a.pct);
  return { best: sorted[0], worst: sorted[sorted.length-1] };
}

export function atRiskStudents(stats, threshold=75) {
  return stats.filter(s=> s.pct < threshold).sort((a,b)=> a.pct - b.pct);
}

export function dateRangeForFilter(type, ref = new Date()) {
  const today = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  if (type === 'today') return { type: 'today', from: today, to: today };
  if (type === 'week') {
    const day = today.getDay(); // 0 Sun..6
    const diff = (day + 6) % 7; // make Monday start (0->6)
    const from = new Date(today);
    from.setDate(today.getDate() - diff);
    const to = new Date(from);
    to.setDate(from.getDate() + 6);
    return { type: 'week', from, to };
  }
  if (type === 'month') {
    const from = new Date(today.getFullYear(), today.getMonth(), 1);
    const to = new Date(today.getFullYear(), today.getMonth()+1, 0);
    return { type: 'month', from, to };
  }
  return { type: 'all', from: new Date(1970,0,1), to: today };
}
