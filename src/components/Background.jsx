import React from 'react';

const WORDS = [
  'ATTENDANCE','ACADEMIC','PRESENT','ABSENT','STUDENT','PROFESSOR','ANALYTICS','SEMESTER','CLASS','SUBJECT','PERCENTAGE','PERFORMANCE','LEARNING','EDUCATION','INSIGHTS','REPORTS','ATTENDX'
];

const positions = [
  { top: '6%', left: '6%', size: 36, opacity: 0.03, rotate: -8 },
  { top: '22%', left: '74%', size: 24, opacity: 0.025, rotate: 6 },
  { top: '44%', left: '10%', size: 28, opacity: 0.02, rotate: -6 },
  { top: '68%', left: '60%', size: 40, opacity: 0.015, rotate: 10 },
  { top: '32%', left: '42%', size: 20, opacity: 0.02, rotate: 0 },
  { top: '82%', left: '18%', size: 22, opacity: 0.015, rotate: -12 }
];

export default function Background(){
  return (
    <div className="site-background" aria-hidden>
      <div className="bg-grid" />
      {positions.map((p, i)=> (
        <div key={i} className="bg-word" style={{ top: p.top, left: p.left, fontSize: p.size, opacity: p.opacity, transform: `rotate(${p.rotate}deg)` }}>
          {WORDS[i % WORDS.length]}
        </div>
      ))}
      <div className="bg-dots" />
    </div>
  );
}
