import React, { useState, useEffect } from 'react';
import { useAuth, UserRole } from '../context/AuthContext';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const { login, register, loginWithGoogle, sendPasswordReset } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<UserRole>('donor');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  // NGO extra fields
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('Trust');
  const [orgRegNumber, setOrgRegNumber] = useState('');

  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [ngoRegistered, setNgoRegistered] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleGoogleLogin = async () => {
    try {
      setError('');
      await loginWithGoogle(role);
      setShowSuccess(true);
      setTimeout(() => {
        onSuccess('Signed in with Google successfully!');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) return;
    try {
      setError('');
      await login(email, password);
      setShowSuccess(true);
      setTimeout(() => {
        onSuccess('Signed in successfully!');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !city || !password) return setError('Please fill in all required fields.');
    if (role === 'ngo' && (!orgName || !orgRegNumber)) return setError('Please fill in organisation name and registration number.');
    try {
      setError('');
      await register(
        name, email, password, role, city,
        role === 'ngo' ? { orgName, orgType, orgRegNumber } : undefined
      );
      if (role === 'ngo') {
        setNgoRegistered(true);
      } else {
        setShowSuccess(true);
        setTimeout(() => {
          onSuccess('Account created! Welcome to Sewa Sankalp Bharat.');
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) return setError('Please enter your email address.');
    setForgotLoading(true);
    try {
      setError('');
      await sendPasswordReset(forgotEmail);
      setForgotSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.');
    } finally {
      setForgotLoading(false);
    }
  };

  // NGO pending verification screen
  if (ngoRegistered) {
    return (
      <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal" style={{ maxHeight: '90vh', overflowY: 'auto', textAlign: 'center' }}>
          <button className="modal-close" onClick={onClose}>×</button>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <div className="modal-title" style={{ fontSize: '22px' }}>Registration Submitted!</div>
          <p style={{ color: 'var(--ink-soft)', fontSize: '14px', lineHeight: 1.6, margin: '12px 0 24px' }}>
            Your organisation <strong>{orgName}</strong> has been registered and is pending verification.
            An admin will review your details and approve your account shortly. You can log in now
            and will see a pending banner until approval.
          </p>
          <div style={{
            background: 'var(--amber-light)',
            border: '1px solid var(--amber)',
            borderRadius: '10px',
            padding: '12px 16px',
            fontSize: '13px',
            color: 'var(--ink)',
            marginBottom: '24px',
            textAlign: 'left'
          }}>
            <strong>📋 What happens next?</strong><br />
            1. Admin reviews your registration<br />
            2. You get full dashboard access on approval<br />
            3. Donors can then match with your NGO
          </div>
          <button className="modal-btn" onClick={() => { onSuccess('NGO registered! Verification pending.'); }}>
            Continue to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <button className="modal-close" onClick={onClose}>×</button>

        {/* Forgot Password Mode */}
        {forgotMode ? (
          <>
            <div className="modal-title">Reset Password</div>
            <p className="modal-sub">Enter your email and we'll send you a reset link.</p>
            {error && (
              <div style={{ color: 'var(--rose)', fontSize: '13px', marginBottom: '16px', padding: '8px', backgroundColor: 'var(--rose-light)', borderRadius: '6px', border: '1px solid rgba(220,53,69,0.2)' }}>
                {error}
              </div>
            )}
            {forgotSent ? (
              <div className="success-banner show">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8l3.5 3.5 6.5-7" stroke="#2e6b5e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Reset link sent! Check your inbox.</span>
              </div>
            ) : (
              <>
                <div className="modal-field">
                  <label className="modal-label">Email address</label>
                  <input className="modal-input" type="email" placeholder="you@example.com" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} />
                </div>
                <button className="modal-btn" onClick={handleForgotPassword} disabled={forgotLoading}>
                  {forgotLoading ? 'Sending...' : 'Send reset link'}
                </button>
              </>
            )}
            <button onClick={() => { setForgotMode(false); setError(''); setForgotSent(false); }} style={{ display: 'block', margin: '16px auto 0', background: 'none', border: 'none', color: 'var(--ink-soft)', fontSize: '13px', cursor: 'pointer' }}>
              ← Back to sign in
            </button>
          </>
        ) : (
          <>
            <div className="modal-title">Get started</div>
            <p className="modal-sub">Join Sewa Sankalp Bharat and start making a difference today.</p>

            {error && (
              <div style={{ color: 'var(--rose)', fontSize: '13px', marginBottom: '16px', padding: '8px', backgroundColor: 'var(--rose-light)', borderRadius: '6px', border: '1px solid rgba(220,53,69,0.2)' }}>
                {error}
              </div>
            )}

            {showSuccess && (
              <div className="success-banner show">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8l3.5 3.5 6.5-7" stroke="#2e6b5e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Success! Redirecting...</span>
              </div>
            )}

            <button
              onClick={handleGoogleLogin}
              className="modal-btn"
              style={{ backgroundColor: 'white', color: 'var(--ink)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0', color: 'var(--ink-mute)', fontSize: '12px' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }}></div>
              <span style={{ padding: '0 12px' }}>OR</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }}></div>
            </div>

            <div className="modal-tabs">
              <button className={`modal-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Sign in</button>
              <button className={`modal-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>Register</button>
            </div>

            {tab === 'login' ? (
              <div className="modal-tab-content active">
                <div className="modal-field">
                  <label className="modal-label">Email</label>
                  <input className="modal-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Password</label>
                  <input className="modal-input" type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                </div>
                <button
                  onClick={() => { setForgotMode(true); setForgotEmail(email); setError(''); }}
                  style={{ display: 'block', textAlign: 'right', width: '100%', background: 'none', border: 'none', color: 'var(--sage)', fontSize: '12px', cursor: 'pointer', marginBottom: '8px', padding: 0 }}
                >
                  Forgot password?
                </button>
                <button className="modal-btn" onClick={handleLogin}>Sign in</button>
              </div>
            ) : (
              <div className="modal-tab-content active">
                <div className="modal-field">
                  <label className="modal-label">I am a</label>
                  <div className="role-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    <button id="role-donor" className={`role-btn ${role === 'donor' ? 'active' : ''}`} onClick={() => setRole('donor')} style={{ padding: '8px', fontSize: '11px' }}>Donor / Volunteer</button>
                    <button id="role-ngo" className={`role-btn ${role === 'ngo' ? 'active' : ''}`} onClick={() => setRole('ngo')} style={{ padding: '8px', fontSize: '11px' }}>NGO / Organisation</button>
                  </div>
                </div>
                <div className="modal-field">
                  <label className="modal-label">Full name</label>
                  <input className="modal-input" type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Email</label>
                  <input className="modal-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="modal-field">
                  <label className="modal-label">City</label>
                  <input className="modal-input" type="text" placeholder="e.g. Kanpur" value={city} onChange={e => setCity(e.target.value)} />
                </div>

                {/* NGO-specific extra fields */}
                {role === 'ngo' && (
                  <>
                    <div style={{ background: 'var(--amber-light)', border: '1px solid var(--amber)', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: 'var(--ink)', marginBottom: '12px' }}>
                      🏛️ NGO accounts require admin verification before going live. Fill in your org details below.
                    </div>
                    <div className="modal-field">
                      <label className="modal-label">Organisation name</label>
                      <input className="modal-input" type="text" placeholder="e.g. Asha Foundation" value={orgName} onChange={e => setOrgName(e.target.value)} />
                    </div>
                    <div className="modal-field">
                      <label className="modal-label">Organisation type</label>
                      <select className="modal-input" value={orgType} onChange={e => setOrgType(e.target.value)} style={{ appearance: 'auto' }}>
                        <option>Trust</option>
                        <option>Society</option>
                        <option>Section 8 Company</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="modal-field">
                      <label className="modal-label">Registration / 12A / 80G number</label>
                      <input className="modal-input" type="text" placeholder="e.g. MH/2021/0012345" value={orgRegNumber} onChange={e => setOrgRegNumber(e.target.value)} />
                    </div>
                  </>
                )}

                <div className="modal-field">
                  <label className="modal-label">Password</label>
                  <input className="modal-input" type="password" placeholder="Choose a password (min. 6 chars)" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <button className="modal-btn" onClick={handleRegister}>
                  {role === 'ngo' ? 'Submit for verification' : 'Create account'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
