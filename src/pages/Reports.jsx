import { useMemo, useState } from "react";
import { filterAttendanceByRange, attendanceTrend, presentAbsentTotals, studentStats, bestAndWorst, atRiskStudents, dateRangeForFilter } from "../utils/stats";
import { formatDate } from "../storage";

function TinyLineChart({points}){
  if(!points || points.length < 2) return (
    <div style={{padding:30, color:'#777'}}>Not enough data to render trend.</div>
  );
  const max = Math.max(...points.map(p=>p.present + p.absent));
  const w = 300, h = 80, pad = 6;
  const step = (w - pad*2) / (points.length-1);
  const path = points.map((p,i)=>{
    const x = pad + i*step;
    const y = h - pad - ((p.present / (max || 1)) * (h - pad*2));
    return `${i===0?'M':'L'} ${x} ${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path d={path} fill="none" stroke="#6958dc" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function Donut({present, absent}){
  const total = present + absent || 1;
  const p = Math.round((present/total)*100);
  const r = 30; const c = 2*Math.PI*r; const theta = (present/total)*c;
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <g transform="translate(60,60)">
        <circle r={r} fill="#f3f2ff" />
        <circle r={r} fill="none" stroke="#dfe8ff" strokeWidth={14} />
        <circle r={r} fill="none" stroke="#6958dc" strokeWidth={14} strokeDasharray={`${theta} ${c-theta}`} strokeDashoffset={-c/4} strokeLinecap="round"/>
        <text x="0" y="6" fontSize="14" fontWeight={700} textAnchor="middle">{p}%</text>
      </g>
    </svg>
  );
}

function Bars({data}){
  if(!data||!data.length) return <div style={{padding:20}}>No data</div>;
  const max = Math.max(...data.map(d=>d.pct||0));
  return (
    <div style={{display:'flex',gap:12,alignItems:'end'}}>
      {data.map(d=> (
        <div key={d.id} style={{width:28}} title={`${d.name}: ${d.pct}%`}>
          <div style={{height: Math.max(6, (d.pct/max)*120), background:'#6958dc', borderRadius:6}} />
          <div style={{fontSize:11, marginTop:6}}>{d.pct}%</div>
        </div>
      ))}
    </div>
  );
}

export default function ReportsPage({ students, attendance }) {
  const [filter, setFilter] = useState('month');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [query, setQuery] = useState("");

  const range = useMemo(()=> dateRangeForFilter(filter, new Date()), [filter]);
  const attendanceFiltered = useMemo(()=> filterAttendanceByRange(attendance, range), [attendance, range]);
  const trend = useMemo(()=> attendanceTrend(attendanceFiltered), [attendanceFiltered]);
  const totals = useMemo(()=> presentAbsentTotals(attendanceFiltered, students.length), [attendanceFiltered, students.length]);
  const stats = useMemo(()=> studentStats(students, attendanceFiltered), [students, attendanceFiltered]);
  const { best, worst } = useMemo(()=> bestAndWorst(stats), [stats]);
  const atRisk = useMemo(()=> atRiskStudents(stats,75), [stats]);

  const filteredStudents = useMemo(()=> {
    const q = query.trim().toLowerCase();
    return stats.filter(s=> !q || s.name.toLowerCase().includes(q) || s.roll.toLowerCase().includes(q));
  }, [stats, query]);

  const exportCSV = () => {
    const rows = [];
    rows.push(['student_id','name','roll','date','present'].join(','));
    for(const day of attendanceFiltered){
      for(const rec of day.records){
        const s = students.find(x=>x.id===rec.studentId);
        rows.push([rec.studentId, JSON.stringify(s?.name||''), s?.roll||'', day.date, rec.present?1:0].join(','));
      }
    }
    const blob = new Blob([rows.join('\n')], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `attendx-report-${filter}-${formatDate()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">REPORTS</p>
          <h1>Reports & Analytics</h1>
          <p className="subtitle">Attendance insights and trends.</p>
        </div>

        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <select value={filter} onChange={(e)=>setFilter(e.target.value)}>
            <option value="today">Today</option>
            <option value="week">This week</option>
            <option value="month">This month</option>
            <option value="all">All time</option>
          </select>
          <button className="add-button" onClick={exportCSV}>Export CSV</button>
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
            <strong>{attendance.find(d=>d.date===formatDate()) ? attendance.find(d=>d.date===formatDate()).records.filter(r=>r.present).length : 0}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">×</div>
          <div>
            <span>Absent Today</span>
            <strong>{students.length - (attendance.find(d=>d.date===formatDate()) ? attendance.find(d=>d.date===formatDate()).records.filter(r=>r.present).length : 0)}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">%</div>
          <div>
            <span>Overall Attendance</span>
            <strong>{attendance.length ? Math.round((attendance.reduce((a,b)=> a + b.records.filter(r=>r.present).length,0) / (students.length * attendance.length)) * 100) || 0 : 0}%</strong>
          </div>
        </div>
      </section>

      <section className="content-card">
        <div className="section-header">
          <div>
            <h2>Trends & Highlights</h2>
            <p>Visual summaries for selected period.</p>
          </div>

          <div style={{display:'flex',gap:12}}>
            <input placeholder="Search student..." value={query} onChange={e=>setQuery(e.target.value)} />
            <button className="add-button" onClick={()=>{setSelectedStudent(null); setQuery('');}}>Clear</button>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:18,padding:20}}>
          <div>
            <h3 style={{marginTop:0}}>Attendance Trend</h3>
            {trend.length ? <TinyLineChart points={trend} /> : <div style={{padding:30}}>Not enough data to show trend.</div>}

            <h3>Present vs Absent (last day)</h3>
            <div style={{display:'flex',gap:18,alignItems:'center'}}>
              <Donut present={totals.last.present} absent={totals.last.absent} />
              <div>
                <div><strong>{totals.last.present}</strong> Present</div>
                <div style={{color:'#777'}}><strong>{totals.last.absent}</strong> Absent</div>
              </div>
            </div>

            <h3 style={{marginTop:18}}>Student Attendance (Top/Bottom)</h3>
            <div style={{display:'flex',gap:12,alignItems:'center'}}>
              <div style={{flex:1}}>
                <div style={{display:'flex',justifyContent:'space-between'}}>
                  <div><small>Best</small><div><strong>{best?best.name:'—'}</strong></div></div>
                  <div><small>Worst</small><div><strong>{worst?worst.name:'—'}</strong></div></div>
                </div>
              </div>
            </div>
          </div>

          <aside style={{background:'#fff',borderRadius:12,padding:16,boxShadow:'0 6px 18px rgba(20,20,40,0.04)'}}>
            <h4 style={{marginTop:0}}>At Risk</h4>
            {atRisk.length ? (
              atRisk.slice(0,6).map(s=> (
                <div key={s.id} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #f2f2f6'}}>
                  <div>
                    <strong>{s.name}</strong>
                    <div style={{fontSize:12,color:'#666'}}>{s.roll}</div>
                  </div>
                  <div style={{color:'#d54e59'}}>{s.pct}%</div>
                </div>
              ))
            ) : (
              <div style={{padding:12,color:'#666'}}>No students below 75% attendance.</div>
            )}

            <hr style={{border:'none',borderTop:'1px solid #f2f2f6',margin:'12px 0'}} />
            <h4 style={{margin:'8px 0'}}>Student Comparison</h4>
            <div style={{overflowX:'auto'}}>
              <Bars data={filteredStudents.slice(0,12)} />
            </div>
          </aside>
        </div>

        <div style={{padding:20}}>
          <h3>Student Details</h3>
          <div style={{display:'flex',gap:18}}>
            <div style={{flex:1}}>
              <table style={{width:'100%'}}>
                <thead>
                  <tr><th>Name</th><th>Roll</th><th>Present</th><th>Absent</th><th>%</th></tr>
                </thead>
                <tbody>
                  {filteredStudents.map(s=> (
                    <tr key={s.id} style={{cursor:'pointer',background:selectedStudent===s.id?'#faf7ff':'transparent'}} onClick={()=>setSelectedStudent(s.id)}>
                      <td>{s.name}</td>
                      <td>{s.roll}</td>
                      <td>{s.present}</td>
                      <td>{s.absent}</td>
                      <td>{s.pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{width:300}}>
              {selectedStudent ? (
                (()=>{
                  const s = filteredStudents.find(x=>x.id===selectedStudent);
                  if(!s) return <div>Select a student</div>;
                  const status = s.pct >= 90 ? 'Excellent' : s.pct >= 75 ? 'Good' : s.pct >= 50 ? 'Warning' : 'Critical';
                  return (
                    <div style={{background:'#fff',padding:16,borderRadius:8}}>
                      <h4 style={{margin:0}}>{s.name}</h4>
                      <div style={{color:'#666'}}>{s.roll}</div>
                      <hr />
                      <div>Total classes: <strong>{s.totalDays}</strong></div>
                      <div>Present: <strong>{s.present}</strong></div>
                      <div>Absent: <strong>{s.absent}</strong></div>
                      <div>Attendance: <strong>{s.pct}%</strong></div>
                      <div style={{marginTop:8}}>Status: <strong>{status}</strong></div>
                    </div>
                  );
                })()
              ) : (
                <div style={{color:'#666'}}>Select a student to view detailed report.</div>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer>
        <span>AttendX</span>
        <span>Smart Attendance Management System</span>
      </footer>
    </>
  );
}
