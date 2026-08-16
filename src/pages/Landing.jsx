import React from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
export default function Landing({ onNavigate, students }){
  return (
    <div className="landing-page">
      <NavBar onNavigate={onNavigate} />

      <main className="hero container" id="home">
        <div className="hero-inner">
          <div className="hero-copy">
            <div className="eyebrow">SMART ATTENDANCE PLATFORM</div>
            <h1>Attendance,<br/><span className="accent">Reimagined.</span></h1>
            <p className="lead">Track attendance, understand performance, and make smarter academic decisions — all from one intelligent platform.</p>

            <div className="hero-ctas">
              <Button onClick={()=>onNavigate('role-select')}>Get Started →</Button>
              <button className="btn btn-ghost" onClick={()=>document.getElementById('features')?.scrollIntoView({behavior:'smooth'})}>Explore Features</button>
            </div>

            <div className="trust" style={{marginTop:22}}>
              <Card className="feature-mini">✓ Real-time insights</Card>
              <Card className="feature-mini">✓ Role-based access</Card>
              <Card className="feature-mini">✓ Academic analytics</Card>
            </div>
          </div>

          <div className="hero-art">
            <div className="command-center card">
              <div className="cc-header">ATTENDANCE</div>
              <div className="cc-main"><div className="cc-pct">87<span className="cc-percent">%</span></div>
                <div className="cc-sub">Today's Classes — 4 / 5 Present</div>
              </div>
              <div className="cc-widgets">
                <div className="cc-widget">Can I Bunk?<div className="cc-strong safe">SAFE</div></div>
                <div className="cc-widget">Attendance Streak<div className="cc-strong">12 Days</div></div>
                <div className="cc-widget">At Risk<div className="cc-strong danger">2 Students</div></div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <section id="features" className="features container">
        <div className="features-header">
          <div className="eyebrow">WHY ATTENDX</div>
          <h2>Everything you need to stay ahead.</h2>
          <p className="muted">A cohesive platform for students and professors to manage attendance, analytics, and academic outcomes.</p>
        </div>
        <div className="features-grid">
          <Card className="feature-card large">Smart Attendance<div className="mini">Live tracking, upserts, and intelligent rules</div></Card>
          <div className="feature-col">
            <Card className="feature-card">Can I Bunk?<div className="mini">Interactive forecast for your attendance</div></Card>
            <Card className="feature-card">Attendance Analytics<div className="mini">Trends, exports, and reports</div></Card>
            <Card className="feature-card">Professor Management<div className="mini">Mark attendance, reports, admin</div></Card>
          </div>
        </div>
      </section>

      <section id="how" className="how container">
        <h2>How it works</h2>
        <div className="timeline">
          <div className="step"><div className="num">01</div><h4>Login</h4><p>Authenticate and open your portal.</p></div>
          <div className="step"><div className="num">02</div><h4>Track</h4><p>Record attendance quickly and accurately.</p></div>
          <div className="step"><div className="num">03</div><h4>Analyze</h4><p>Use analytics to spot trends and at-risk students.</p></div>
          <div className="step"><div className="num">04</div><h4>Decide</h4><p>Make informed academic decisions and interventions.</p></div>
        </div>
      </section>

      <section className="cta container">
        <h3>Your attendance. Your decisions. Your advantage.</h3>
        <p className="muted">Start making smarter academic decisions with AttendX.</p>
        <div style={{marginTop:18}}><Button onClick={()=>onNavigate('role-select')}>Get Started →</Button></div>
      </section>

      <Footer />
    </div>
  );
}
