export function computeStudentOverall(studentId, students, attendance) {
  const days = attendance.slice().sort((a,b)=>a.date.localeCompare(b.date));
  const totalDays = days.length;
  const present = days.reduce((acc, day) => acc + ((day.records||[]).find(r=>r.studentId===studentId && r.present) ? 1 : 0), 0);
  const absent = totalDays - present;
  const pct = totalDays ? Math.round((present/totalDays)*100) : 0;

  // classes needed to reach 75%: find minimal x >=0 such that (present + x) / (totalDays + x) >= 0.75
  let need = 0;
  if (totalDays > 0 && pct < 75) {
    let x = 0;
    while (true) {
      if ((present + x) / (totalDays + x) >= 0.75) {
        need = x;
        break;
      }
      x++;
      if (x > 10000) { need = x; break; }
    }
  }

  // classes can miss while staying >=75%
  let canMiss = 0;
  if (totalDays > 0 && pct >= 75) {
    // find max m >=0 such that present/(totalDays + m) >= 0.75
    const m = Math.floor((present / 0.75) - totalDays);
    canMiss = Math.max(0, m);
  }

  return { studentId, totalDays, present, absent, pct, need, canMiss };
}

export function attendanceStatusFromPct(pct) {
  if (pct >= 90) return 'Excellent';
  if (pct >= 80) return 'Good';
  if (pct >= 75) return 'Safe';
  return 'At Risk';
}

export function computeStreak(studentId, attendance) {
  if (!attendance || attendance.length === 0) return 0;
  const days = attendance.slice().sort((a,b)=>a.date.localeCompare(b.date));
  // count consecutive present entries from the end
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    const day = days[i];
    const rec = (day.records||[]).find(r=>r.studentId===studentId && r.present);
    if (rec) streak++; else break;
  }
  return streak;
}
