import React, { useState } from 'react';
import auth from '../auth';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function ProfessorLogin({ onLogin, onBack }){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e){
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await auth.signInWithEmail(email, password);
    setLoading(false);
    if(res.ok){
      const session = res.session;
      if(!session.profile || session.profile.role !== 'professor'){
        setError('This account is not a professor or profile is missing.');
        return;
      }
      onLogin(session);
    } else {
      setError(res.error || 'Login failed');
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-left">
        <div className="auth-branding">
          <div className="brand-icon">A</div>
          <h2>AttendX</h2>
          <p className="muted">Manage your classroom with confidence.</p>
        </div>
      </div>

      <div className="auth-right">
        <div style={{maxWidth:420,margin:'0 auto'}}>
          <h3>Professor Sign in</h3>
          <Card className="auth-card">
            <form onSubmit={submit}>
              <label className="form-row"><div>Email</div><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@school.edu" /></label>
              <label className="form-row"><div>Password</div>
                <div style={{display:'flex',gap:8}}>
                  <input type={show? 'text' : 'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" />
                  <button type="button" className="btn btn-ghost" onClick={()=>setShow(s=>!s)}>{show? 'Hide' : 'Show'}</button>
                </div>
              </label>

              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:12}}>
                <label style={{display:'flex',gap:8,alignItems:'center'}}><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} /> Remember me</label>
                <a className="muted">Forgot password?</a>
              </div>

              {error && <div className="error-msg">{error}</div>}

              <div style={{display:'flex',justifyContent:'flex-end',marginTop:14}}>
                <Button type="submit">{loading? 'Signing in...' : 'Sign in'}</Button>
              </div>
            </form>
          </Card>
          <div style={{marginTop:12}}><button className="btn btn-ghost" onClick={onBack}>Back to AttendX</button></div>
        </div>
      </div>
    </div>
  );
}
