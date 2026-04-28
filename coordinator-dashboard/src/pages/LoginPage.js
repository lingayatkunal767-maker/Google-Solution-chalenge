// src/pages/LoginPage.js
import React, { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('coordinator@ngo.org');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      {/* Background mesh */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 20% 50%, rgba(0,212,184,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(167,139,250,0.06) 0%, transparent 50%)',
      }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56,
            background: 'linear-gradient(135deg, var(--accent-teal), #00a88f)',
            borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, margin: '0 auto 14px',
            boxShadow: 'var(--shadow-glow-teal)',
          }}>🤝</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24 }}>
            VolunteerMatch AI
          </div>
          <div className="text-muted text-sm" style={{ marginTop: 4 }}>
            Coordinator Dashboard
          </div>
        </div>

        {/* Card */}
        <div className="card-elevated">
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, marginBottom: 4 }}>
              Welcome back
            </div>
            <div className="text-muted text-sm">Sign in to manage your volunteer operations</div>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="coordinator@ngo.org"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-full"
              style={{ width: '100%', justifyContent: 'center', padding: '11px', marginTop: 4 }}
              disabled={loading}
            >
              {loading ? (
                <><div className="spinner" style={{ width: 16, height: 16 }} /> Signing in…</>
              ) : 'Sign In →'}
            </button>
          </form>

          <div className="divider" />

          <div className="text-muted text-sm" style={{ textAlign: 'center' }}>
            Demo mode: any credentials will work
          </div>
        </div>
      </div>
    </div>
  );
}
