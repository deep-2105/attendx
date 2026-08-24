import React from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import Button from '../components/ui/Button';

export default function RoleSelection({ onNavigate }){
  return (
    <div className="role-page">
      <NavBar onNavigate={onNavigate} />

      <main className="container" style={{padding:'80px 40px'}}>
        <div style={{maxWidth:900,margin:'0 auto',textAlign:'center'}}>
          <div className="eyebrow">Welcome to AttendX</div>
          <h1>Choose how you want to continue</h1>
          <p className="muted">Select your role to enter the appropriate portal.</p>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,marginTop:28}}>
            <div className="card" style={{padding:24,textAlign:'left'}}>
              <h3>Student</h3>
              <p className="muted">Personal attendance insights, trends and subjects.</p>
              <div style={{marginTop:18}}><Button onClick={()=>onNavigate('student-login')}>Continue as Student →</Button></div>
            </div>

            <div className="card" style={{padding:24,textAlign:'left'}}>
              <h3>Professor</h3>
              <p className="muted">Manage classes, mark attendance and generate reports.</p>
              <div style={{marginTop:18}}><Button onClick={()=>onNavigate('professor-login')}>Continue as Professor →</Button></div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
