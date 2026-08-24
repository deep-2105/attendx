import { useState } from 'react';
import auth from '../auth';

export default function StudentLogin({ students, onLogin, onBack }){
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e){
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!identifier.trim() || !password.trim()) {
      setError('Please enter your email or roll number and password.');
      return;
    }

    setLoading(true);
    // For Supabase flow, we accept email or roll as identifier. If the user typed a roll, try to map to email via students list.
    let loginId = identifier.trim();
    const s = (students || []).find(x => String(x.roll).toLowerCase() === String(identifier).toLowerCase());
    if (s && s.email) loginId = s.email;

    const res = await auth.signInWithEmail(loginId, password);
    setLoading(false);
    if(res.ok){
      const session = res.session;
      if(!session.profile || session.profile.role !== 'student'){
        setError('Your account is authenticated, but your AttendX profile could not be found.');
        return;
      }
      setSuccess('Login successful. Redirecting to your dashboard...');
      onLogin(session);
    } else {
      setError(res.error || 'Login failed');
    }
  }

  return (
    <div className="ax-auth-page ax-page-enter">
      <section className="ax-auth-brand-panel">
        <div className="ax-brand">
          <span className="ax-brand-mark">A</span>
          <div>
            <strong>AttendX</strong>
            <small>Smart Attendance. Smarter Decisions.</small>
          </div>
        </div>

        <div className="ax-auth-copy">
          <h1>Student Login</h1>
          <p>Welcome back! Login to continue.</p>
          <ul>
            <li>Track your attendance progress</li>
            <li>Use the attendance shortage calculator</li>
            <li>Stay ahead with subject-wise insights</li>
          </ul>
        </div>
      </section>

      <section className="ax-auth-form-panel">
        <div className="ax-auth-card">
          <h2>Student Login</h2>
          <p>Welcome back! Login to continue.</p>

          <form onSubmit={submit} className="ax-auth-form" noValidate>
            <label>
              <span>Email or Roll Number</span>
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="BCA001 or you@school.edu"
                autoComplete="username"
              />
            </label>

            <label>
              <span>Password</span>
              <div className="ax-password-row">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                />
                <button type="button" className="ax-icon-btn" onClick={() => setShowPassword((v) => !v)}>
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            <div className="ax-form-options">
              <label className="ax-remember">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                Remember me
              </label>
              <button type="button" className="ax-link-btn">Forgot Password?</button>
            </div>

            {error && <div className="ax-form-error">{error}</div>}
            {success && <div className="ax-form-success">{success}</div>}

            <button type="submit" className="ax-primary-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login as Student'}
            </button>

            <button type="button" className="ax-secondary-btn">Create Student Account</button>
            <button type="button" className="ax-back-btn" onClick={onBack}>Back to AttendX</button>
          </form>
        </div>
      </section>
    </div>
  );
}
