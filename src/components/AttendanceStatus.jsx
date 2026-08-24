import React from 'react';
import { attendanceStatusFromPct } from '../utils/attendance';

export default function AttendanceStatus({ pct }){
  const status = attendanceStatusFromPct(pct);
  const color = status === 'Excellent' ? '#16a34a' : status === 'Good' ? '#06b6d4' : status === 'Safe' ? '#f59e0b' : '#ef4444';
  return (
    <span style={{display:'inline-block', padding:'6px 10px', borderRadius:999, background:color + '20', color, fontWeight:700, fontSize:12}}>{status}</span>
  );
}
