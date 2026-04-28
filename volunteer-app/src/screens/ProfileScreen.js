// volunteer-app/src/screens/ProfileScreen.js
import React, { useState } from 'react';

const ALL_SKILLS = ['medical', 'first-aid', 'emergency-response', 'counseling', 'psychology',
  'teaching', 'logistics', 'driving', 'physical-labor', 'rescue', 'communication', 'child-care'];

export default function ProfileScreen() {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Ramesh Patel',
    phone: '+91 98765 43210',
    address: 'Shivajinagar, Pune',
    skills: ['medical', 'first-aid', 'emergency-response', 'counseling'],
    weekdays: true,
    weekends: true,
  });

  const toggleSkill = (s) => {
    setProfile(p => ({
      ...p,
      skills: p.skills.includes(s) ? p.skills.filter(x => x !== s) : [...p.skills, s],
    }));
  };

  return (
    <div className="screen fade-up">
      <div className="screen-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="screen-title">Profile</div>
          <button
            className={`btn btn-sm ${editing ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setEditing(e => !e)}
          >
            {editing ? '✓ Save' : '✏️ Edit'}
          </button>
        </div>
      </div>

      {/* Avatar & Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '0 16px', marginBottom: 20 }}>
        <div className="avatar-large">RP</div>
        <div>
          {editing ? (
            <input
              className="input"
              value={profile.name}
              onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
              style={{ fontSize: 18, fontWeight: 700 }}
            />
          ) : (
            <div style={{ fontWeight: 800, fontSize: 20 }}>{profile.name}</div>
          )}
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>Volunteer · Pune, Maharashtra</div>
          <div style={{ display: 'flex', gap: 4, marginTop: 5 }}>
            <span style={{ color: '#f59e0b', fontSize: 13 }}>★★★★★</span>
            <span style={{ fontSize: 12, color: 'var(--text-2)' }}>4.7 · 15 tasks</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 10, padding: '0 16px', marginBottom: 16 }}>
        {[
          { label: 'Completed', val: 15 },
          { label: 'Rating', val: '4.7' },
          { label: 'Response', val: '93%' },
          { label: 'Points', val: '840' },
        ].map(s => (
          <div key={s.label} className="stat-pill">
            <div className="stat-pill-val">{s.val}</div>
            <div className="stat-pill-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Progress to next badge */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 13 }}>🏅 Progress to Gold</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)' }}>15 / 20 tasks</div>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: '75%' }} />
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>
          5 more tasks to unlock Power Volunteer badge ⚡
        </div>
      </div>

      {/* Skills */}
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 12 }}>🛠 Skills</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {ALL_SKILLS.map(s => (
            <button
              key={s}
              className="skill-pill"
              style={{
                cursor: editing ? 'pointer' : 'default',
                background: profile.skills.includes(s) ? '#f0fdf9' : 'var(--bg-elevated)',
                border: `1px solid ${profile.skills.includes(s) ? 'var(--green)' : 'var(--border)'}`,
                color: profile.skills.includes(s) ? 'var(--green)' : 'var(--text-2)',
                fontWeight: profile.skills.includes(s) ? 700 : 600,
                padding: '6px 12px',
              }}
              onClick={() => editing && toggleSkill(s)}
            >
              {profile.skills.includes(s) && '✓ '}{s}
            </button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 12 }}>🗓 Availability</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          {['weekdays', 'weekends'].map(day => (
            <button
              key={day}
              className={`btn btn-sm ${profile[day] ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, textTransform: 'capitalize' }}
              onClick={() => editing && setProfile(p => ({ ...p, [day]: !p[day] }))}
            >
              {profile[day] ? '✓ ' : ''}{day}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
          ⏱ Flexible: 09:00 – 17:00
        </div>
      </div>

      {/* Contact */}
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 12 }}>📞 Contact Info</div>
        {editing ? (
          <>
            <input
              className="input"
              value={profile.phone}
              onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
              style={{ marginBottom: 10 }}
              placeholder="Phone number"
            />
            <input
              className="input"
              value={profile.address}
              onChange={e => setProfile(p => ({ ...p, address: e.target.value }))}
              placeholder="Address"
            />
          </>
        ) : (
          <>
            <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 6 }}>📱 {profile.phone}</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)' }}>📍 {profile.address}</div>
          </>
        )}
      </div>

      {/* Logout */}
      <div style={{ padding: '0 16px 30px' }}>
        <button className="btn btn-danger btn-full">Sign Out</button>
      </div>
    </div>
  );
}
