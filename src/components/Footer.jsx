import React from 'react';

export default function Footer(){
  return (
    <footer className="site-footer">
      <div className="footer-inner container">
        <div className="col">
          <div className="brand">AttendX</div>
          <div className="muted">Smart Attendance. Smarter Decisions.</div>
        </div>

        <div className="col">
          <h4>Product</h4>
          <nav className="footer-links">
            <a>Features</a>
            <a>How it works</a>
            <a>Analytics</a>
          </nav>
        </div>

        <div className="col">
          <h4>Company</h4>
          <nav className="footer-links">
            <a>About</a>
            <a>Contact</a>
          </nav>
        </div>

        <div className="col">
          <h4>For</h4>
          <nav className="footer-links">
            <a>Students</a>
            <a>Professors</a>
          </nav>
        </div>
      </div>
      <div className="container" style={{borderTop:'1px solid rgba(255,255,255,0.02)',paddingTop:16,marginTop:18}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div className="muted">© {new Date().getFullYear()} AttendX. All rights reserved.</div>
          <div className="muted">Privacy · Terms</div>
        </div>
      </div>
    </footer>
  );
}
