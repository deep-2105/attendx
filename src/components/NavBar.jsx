import React, {useState} from 'react';
import Button from './ui/Button';

export default function NavBar({ onNavigate }){
  const [open, setOpen] = useState(false);
  return (
    <header className="nav" role="navigation">
      <div className="nav-inner container">
        <div className="brand" style={{display:'flex',alignItems:'center',gap:12}}>
          <div className="brand-icon">A</div>
          <div style={{display:'flex',flexDirection:'column'}}>
            <div className="brand-text">AttendX</div>
            <div className="brand-tag">Smarter Attendance. Smarter Decisions.</div>
          </div>
        </div>

        <nav className={`nav-links ${open ? 'open' : ''}`} aria-label="Main">
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#how">How It Works</a>
          <a href="#about">About</a>
        </nav>

        <div className="nav-actions">
          <button className="link" onClick={()=>onNavigate && onNavigate('role-select')}>Login</button>
          <Button onClick={()=>onNavigate && onNavigate('role-select')}>Get Started</Button>
          <button aria-label="Menu" className="burger" onClick={()=>setOpen(s=>!s)}>☰</button>
        </div>
      </div>

      {open && (
        <div className="mobile-menu">
          <a href="#home" onClick={()=>setOpen(false)}>Home</a>
          <a href="#features" onClick={()=>setOpen(false)}>Features</a>
          <a href="#how" onClick={()=>setOpen(false)}>How It Works</a>
          <a href="#about" onClick={()=>setOpen(false)}>About</a>
          <div style={{marginTop:12}}>
            <button className="link" onClick={()=>{ setOpen(false); onNavigate && onNavigate('role-select'); }}>Login</button>
            <button className="btn btn-primary" onClick={()=>{ setOpen(false); onNavigate && onNavigate('role-select'); }}>Get Started</button>
          </div>
        </div>
      )}
    </header>
  );
}
