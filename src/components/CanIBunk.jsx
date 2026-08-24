import { useMemo, useState } from 'react';
import { computeStudentOverall, computeStreak } from '../utils/attendance';
import AttendanceStatus from './AttendanceStatus';

export default function CanIBunk({ students, attendance }){
  const [selected, setSelected] = useState(students[0]?.id || null);

  const stats = useMemo(()=>{
    if(!selected) return null;
    return computeStudentOverall(selected, students, attendance);
  }, [selected, students, attendance]);

  const streak = useMemo(()=> selected ? computeStreak(selected, attendance) : 0, [selected, attendance]);

  if(!students || students.length===0) return (
    <div className="content-card" style={{padding:20}}>No students available to compute bunk.</div>
  );

  return (
    <div className="content-card" style={{padding:18}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <h3 style={{margin:'0 0 6px'}}>Can I Bunk?</h3>
          <p style={{margin:0,color:'#666'}}>Let's calculate your attendance risk.</p>
        </div>
        <div>
          <select value={selected} onChange={e=>setSelected(Number(e.target.value))}>
            {students.map(s=> <option key={s.id} value={s.id}>{s.name} — {s.roll}</option>)}
          </select>
        </div>
      </div>

      {stats ? (
        <div style={{display:'flex',gap:18,marginTop:12,alignItems:'center'}}>
          <div style={{flex:1}}>
            <div>Current attendance: <strong>{stats.pct}%</strong> <AttendanceStatus pct={stats.pct} /></div>
            <div>Total classes: <strong>{stats.totalDays}</strong></div>
            <div>Present: <strong>{stats.present}</strong> — Absent: <strong>{stats.absent}</strong></div>
            <div style={{marginTop:8}}>
              {stats.pct >= 75 ? (
                <div> You can miss <strong>{stats.canMiss}</strong> more class(es) and remain at 75% or above.</div>
              ) : (
                <div> You need to attend <strong>{stats.need}</strong> consecutive class(es) to reach 75%.</div>
              )}
            </div>
            <div style={{marginTop:8,color:'#666'}}>
              {streak > 0 ? (<div>🔥 {streak}-day attendance streak</div>) : (<div>Start your attendance streak today.</div>)}
            </div>
          </div>
        </div>
      ) : (
        <div style={{padding:12}}>Select a student</div>
      )}
    </div>
  );
}
