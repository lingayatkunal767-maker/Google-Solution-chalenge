// volunteer-app/src/screens/LoginScreen.js
import React, { useState } from 'react';

export default function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 1200);
  };

  return (
    <div style={{
      minHeight: '844px',
      background: 'linear-gradient(160deg, #0d1f1b 0%, #0a1628 50%, #131020 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background circles */}
      <div style={{
        position: 'absolute', top: -80, left: -80,
        width: 260, height: 260, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,200,150,0.12) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', bottom: -60, right: -60,
        width: 200, height: 200, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
      }} />

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 32, position: 'relative' }}>
        <div style={{
          width: 64, height: 64,
          background: 'linear-gradient(135deg, #00c896, #0097a7)',
          borderRadius: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, margin: '0 auto 12px',
          boxShadow: '0 0 24px rgba(0,200,150,0.25)',
        }}>🤝</div>
        <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 22, color: 'white' }}>
          VolunteerMatch
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
          Connect. Help. Change lives.
        </div>
      </div>

      {/* Card */}
      <div style={{
        background: 'white',
        borderRadius: 24,
        padding: '24px 20px',
        width: '100%',
        maxWidth: 340,
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      }}>
        {/* Tabs */}
        <div style={{
          display: 'flex', background: '#f1f5f9', borderRadius: 12,
          padding: 4, marginBottom: 20,
        }}>
          {['login', 'signup'].map(m => (
            <button
              key={m}
              style={{
                flex: 1, padding: '8px', borderRadius: 9,
                border: 'none', cursor: 'pointer', fontWeight: 700,
                fontSize: 13, fontFamily: 'Plus Jakarta Sans, sans-serif',
                background: mode === m ? 'white' : 'transparent',
                color: mode === m ? '#0f172a' : '#64748b',
                boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s',
                textTransform: 'capitalize',
              }}
              onClick={() => setMode(m)}
            >
              {m === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 5 }}>
                Full Name
              </label>
              <input
                className="input"
                placeholder="Ramesh Patel"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 5 }}>
              Email
            </label>
            <input
              className="input"
              type="email"
              placeholder="volunteer@email.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 5 }}>
              Password
            </label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            style={{ marginBottom: 12 }}
          >
            {loading ? '...' : mode === 'login' ? 'Sign In →' : 'Create Account →'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>
          Demo: tap Sign In to proceed
        </div>
      </div>
    </div>
  );
}
