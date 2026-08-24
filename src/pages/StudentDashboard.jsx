import React, { useMemo } from 'react';
import { computeStudentOverall, computeStreak, attendanceStatusFromPct } from '../utils/attendance';
import AttendanceStatus from '../components/AttendanceStatus';
import StudentTopNav from '../components/StudentTopNav';

export default function StudentDashboard({ students, attendance, onLogout, session }){
  const studentId = session?.profile?.id;
  const student = students.find(s=>s.id === studentId) || { name: 'Student' };

  const stats = useMemo(()=> studentId ? computeStudentOverall(studentId, students, attendance) : null, [studentId, students, attendance]);
  const streak = useMemo(()=> studentId ? computeStreak(studentId, attendance) : 0, [studentId, attendance]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const heroMessage = (()=>{
    if(!stats) return 'Your attendance story continues...';
    const pct = stats.pct;
    if(pct >= 90) return "You're safe. Keep the streak alive.";
    if(pct >= 75) return "You're doing well. Don't lose the momentum.";
    if(pct >= 60) return "Careful. One more absence could hurt.";
    if(pct >= 50) return "You're in the danger zone.";
    return "This is getting serious.";
  })();

  return (
    <div className="student-portal">
      <StudentTopNav name={student.name} />
      <div className="topbar">
        <div>
          <div className="eyebrow">Student Portal</div>
          <h1>{greeting}, {student.name}.</h1>
          <p className="subtitle">{heroMessage}</p>
        </div>
        <div className="date-box">
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <strong>{student.roll || ''}</strong>
          </div>
          <div style={{marginTop:8}}>
            <button onClick={onLogout} style={{border:0,background:'#f3f4f6',padding:'8px 10px',borderRadius:8}}>Logout</button>
          </div>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 360px',gap:18}}>
        <div>
          <div className="content-card" style={{padding:22}}>
            <h3 style={{marginTop:0}}>Your attendance</h3>
            {stats ? (
              <div style={{display:'flex',alignItems:'center',gap:20}}>
                <div style={{width:220,height:220,display:'grid',placeItems:'center',borderRadius:18,background:'linear-gradient(135deg,#0f1724 0%, rgba(105,88,220,0.08) 100%)',boxShadow:'0 20px 60px rgba(10,8,20,0.45)'}}>
                  <div style={{textAlign:'center',color:'#fff'}}>
                    <div style={{fontSize:56,fontWeight:800,letterSpacing:-1}}>{stats.pct}%</div>
                    <div style={{marginTop:10}}><AttendanceStatus pct={stats.pct} /></div>
                  </div>
                </div>

                <div style={{flex:1}}>
                  <div>Present: <strong>{stats.present}</strong></div>
                  <div>Absent: <strong>{stats.absent}</strong></div>
                  <div>Total classes: <strong>{stats.totalDays}</strong></div>
                  <div style={{marginTop:12,color:'#e6e9f2'}}>
                    {stats.pct >= 90 ? (
                      <div style={{color:'#c7f3d6'}}>You're in excellent shape. Keep going.</div>
                    ) : stats.pct >= 75 ? (
                      <div style={{color:'#dbeafe'}}>You're secure. Maintain the rhythm.</div>
                    ) : stats.pct >= 60 ? (
                      <div style={{color:'#fef3c7'}}>Careful — prioritize next classes.</div>
                    ) : (
                      <div style={{color:'#fee2e2'}}>Immediate action required. Reach out for help.</div>
                    )}
                  </div>
                  <div style={{marginTop:12,color:'#ffd6a5'}}>{streak>0 ? `🔥 ${streak} class attendance streak` : 'Your streak starts today.'}</div>
                </div>
              </div>
            ) : (
              <div className="empty"><h3>No attendance history</h3><p>Attend classes to build your attendance history.</p></div>
            )}
          </div>

          <div style={{marginTop:14}} className="content-card">
            <div className="section-header"><h2>Can I Bunk?</h2><p>Let's check before you make a questionable decision.</p></div>
            <div style={{padding:18}}>
              {stats ? (
                <div>
                  <p style={{margin:0}}>Current attendance: <strong>{stats.pct}%</strong> — Present: <strong>{stats.present}</strong> / <strong>{stats.totalDays}</strong></p>
                  <div style={{marginTop:12}}>
                    {stats.pct >= 75 ? (
                      <div>You can miss <strong>{stats.canMiss}</strong> more class(es) and remain at 75%.</div>
                    ) : (
                      <div>Don't risk another absence. You need <strong>{stats.need}</strong> consecutive present class(es) to reach 75%.</div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{padding:12}}>Insufficient data to evaluate.</div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="content-card" style={{padding:18}}>
            <h3 style={{marginTop:0}}>Quick stats</h3>
            <div style={{marginTop:8}}>
              <div>Attendance status: <strong>{stats ? attendanceStatusFromPct(stats.pct) : '—'}</strong></div>
              <div style={{marginTop:8}}>Last recorded streak: <strong>{streak}</strong></div>
            </div>
          </div>

          <div style={{marginTop:12}} className="content-card" style={{padding:18}}>
            <h3 style={{marginTop:0}}>My Analytics</h3>
            <div style={{marginTop:8,color:'#666'}}>Attendance trend and personal analytics appear here. Subject breakdown isn't available in this demo.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
