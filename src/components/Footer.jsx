
export default function Footer(){
  return (
    <footer className="lp-footer">
      <div className="lp-container lp-footer-grid">
        <div className="lp-footer-col">
          <h3>AttendX</h3>
          <p>Smart Attendance. Smarter Decisions.</p>
        </div>

        <div className="lp-footer-col">
          <h4>Product</h4>
          <nav className="lp-footer-links">
            <a>Features</a>
            <a>How it works</a>
            <a>Analytics</a>
          </nav>
        </div>

        <div className="lp-footer-col">
          <h4>Company</h4>
          <nav className="lp-footer-links">
            <a>About</a>
            <a>Contact</a>
          </nav>
        </div>

        <div className="lp-footer-col">
          <h4>For</h4>
          <nav className="lp-footer-links">
            <a>Students</a>
            <a>Professors</a>
          </nav>
        </div>

        <div className="lp-footer-col">
          <h4>Legal</h4>
          <nav className="lp-footer-links">
            <a>Privacy</a>
            <a>Terms</a>
          </nav>
        </div>
      </div>

      <div className="lp-container lp-footer-bottom">
        <small>© 2026 AttendX. All rights reserved.</small>
      </div>
    </footer>
  );
}
