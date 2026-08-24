import {useState} from 'react';

export default function NavBar({ onNavigate }){
  const [open, setOpen] = useState(false);
  return (
    <header className="lp-nav" role="navigation">
      <div className="lp-container lp-nav-inner">
        <div className="lp-brand-wrap">
          <div className="lp-brand-icon">A</div>
          <div className="lp-brand-copy">
            <div className="lp-brand-title">AttendX</div>
            <div className="lp-brand-tag">Smart Attendance. Smarter Decisions.</div>
          </div>
        </div>

        <nav className={`lp-nav-links ${open ? 'open' : ''}`} aria-label="Main">
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#how">How It Works</a>
          <a href="#students">For Students</a>
          <a href="#professors">For Professors</a>
          <a href="#about">About</a>
        </nav>

        <div className="lp-nav-actions">
          <button className="lp-btn lp-btn-secondary" onClick={()=>onNavigate && onNavigate('role-select')}>Login</button>
          <button className="lp-btn lp-btn-primary" onClick={()=>onNavigate && onNavigate('role-select')}>Get Started Free</button>
          <button aria-label="Menu" className="lp-burger" onClick={()=>setOpen(s=>!s)}>☰</button>
        </div>
      </div>

      {open && (
        <div className="lp-mobile-menu">
          <a href="#home" onClick={()=>setOpen(false)}>Home</a>
          <a href="#features" onClick={()=>setOpen(false)}>Features</a>
          <a href="#how" onClick={()=>setOpen(false)}>How It Works</a>
          <a href="#students" onClick={()=>setOpen(false)}>For Students</a>
          <a href="#professors" onClick={()=>setOpen(false)}>For Professors</a>
          <a href="#about" onClick={()=>setOpen(false)}>About</a>
          <div className="lp-mobile-actions">
            <button className="lp-btn lp-btn-secondary" onClick={()=>{ setOpen(false); onNavigate && onNavigate('role-select'); }}>Login</button>
            <button className="lp-btn lp-btn-primary" onClick={()=>{ setOpen(false); onNavigate && onNavigate('role-select'); }}>Get Started Free</button>
          </div>
        </div>
      )}
    </header>
  );
}
