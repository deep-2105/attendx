import React, { useState } from 'react';
import auth from '../auth';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function StudentLogin({ students, onLogin, onBack }){
  const [roll, setRoll] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e){
    e.preventDefault();
    setError('');
    setLoading(true);
    // For Supabase flow, we accept email or roll as identifier. If the user typed a roll, try to map to email via students list.
    let identifier = roll;
    const s = (students || []).find(x => String(x.roll) === String(roll));
    if (s && s.email) identifier = s.email;

    const res = await auth.signInWithEmail(identifier, password);
    setLoading(false);
    if(res.ok){
      const session = res.session;
      if(!session.profile || session.profile.role !== 'student'){
        setError('This account is not a student or profile is missing.');
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
          <p className="muted">Stay ahead of your attendance.</p>
        </div>
      </div>

      <div className="auth-right">
        <div style={{maxWidth:420,margin:'0 auto'}}>
          <h3>Student Sign in</h3>
          <Card className="auth-card">
            <form onSubmit={submit}>
              <label className="form-row"><div>Roll Number or Email</div><input value={roll} onChange={e=>setRoll(e.target.value)} placeholder="BCA001 or you@school.edu" /></label>
              <label className="form-row"><div>Password</div><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" /></label>

              {error && <div className="error-msg">{error}</div>}

              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:12}}>
                <a className="muted">Forgot password?</a>
                <div>
                  <Button type="submit">{loading? 'Signing in...' : 'Sign in'}</Button>
                </div>
              </div>
            </form>
          </Card>
          <div style={{marginTop:12}}><button className="btn btn-ghost" onClick={onBack}>Back to AttendX</button></div>
        </div>
      </div>
    </div>
  );
}
