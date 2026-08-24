import React from 'react';

export default function StudentTopNav({ name }){
  return (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
      <div style={{display:'flex',gap:12,alignItems:'center'}}>
        <div style={{width:44,height:44,borderRadius:10,background:'linear-gradient(90deg,#7c6cf2,#5b8bff)',display:'grid',placeItems:'center',color:'#fff',fontWeight:800}}>A</div>
        <nav style={{display:'flex',gap:12}}>
          <button className="link">Dashboard</button>
          <button className="link">Attendance</button>
          <button className="link">Analytics</button>
          <button className="link">Can I Bunk?</button>
        </nav>
      </div>

      <div style={{display:'flex',gap:12,alignItems:'center'}}>
        <div style={{position:'relative'}}><button className="btn btn-ghost">🔔</button></div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:36,height:36,borderRadius:999,background:'#fff2',display:'grid',placeItems:'center'}}>{name?name.charAt(0):'S'}</div>
          <div style={{textAlign:'right'}}>
            <div style={{fontWeight:700}}>{name}</div>
            <div style={{fontSize:12,color:'var(--muted)'}}>Student</div>
          </div>
        </div>
      </div>
    </div>
  );
}
