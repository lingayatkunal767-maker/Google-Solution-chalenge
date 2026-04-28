// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { mockNeeds, mockAnalytics, mockTopMatches, mockVolunteers } from '../utils/mockData';
import MatchCard from '../components/MatchCard';

function StatCard({ icon, value, label, change, accentColor, accentDim }) {
  return (
    <div className="stat-card" style={{ '--stat-accent': accentColor, '--stat-accent-dim': accentDim }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {change && <div className={`stat-change ${change > 0 ? 'up' : 'down'}`}>
        {change > 0 ? '↑' : '↓'} {Math.abs(change)}% this month
      </div>}
    </div>
  );
}

function NeedRow({ need }) {
  const urgencyClass = { immediate: 'badge-immediate', urgent: 'badge-urgent', planned: 'badge-planned' };
  const statusClass = { open: 'badge-open', assigned: 'badge-assigned', completed: 'badge-completed' };
  const timeSince = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <tr>
      <td>
        <div style={{ fontWeight: 600, marginBottom: 3 }}>{need.title}</div>
        <div className="text-muted text-sm">{need.location?.address}</div>
      </td>
      <td>
        <span className={`badge ${urgencyClass[need.urgency]}`}>
          {need.urgency === 'immediate' ? '🔴' : need.urgency === 'urgent' ? '🟡' : '🟢'} {need.urgency}
        </span>
      </td>
      <td>
        <span className={`badge ${statusClass[need.status]}`}>{need.status}</span>
      </td>
      <td className="text-muted text-sm">{timeSince(need.createdAt)}</td>
      <td>
        <div style={{ display: 'flex', gap: 6 }}>
          {need.requiredSkills.slice(0, 2).map(s => (
            <span key={s} className="skill-chip">{s}</span>
          ))}
          {need.requiredSkills.length > 2 && (
            <span className="skill-chip">+{need.requiredSkills.length - 2}</span>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function Dashboard() {
  const [selectedNeed, setSelectedNeed] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const { overview } = mockAnalytics;

  const handleTriggerMatch = (need) => {
    setSelectedNeed(need);
    setLoading(true);
    setTimeout(() => {
      setMatches(mockTopMatches);
      setLoading(false);
    }, 1400);
  };

  const handleAssign = (match) => {
    alert(`✅ Assigned ${match.volunteerName} to "${selectedNeed?.title}"!\nNotification sent via push.`);
  };

  return (
    <div className="page-container fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Command Center</div>
          <div className="page-subtitle">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            {' '}· Pune, Maharashtra
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary btn-sm">⊕ Export Report</button>
          <button className="btn btn-primary btn-sm" onClick={() => window.location.href = '/needs'}>
            + New Need
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard icon="◈" value={overview.openNeeds} label="Open Needs" change={12}
          accentColor="var(--accent-coral)" accentDim="var(--accent-coral-dim)" />
        <StatCard icon="◎" value={overview.totalVolunteers} label="Active Volunteers" change={8}
          accentColor="var(--accent-teal)" accentDim="var(--accent-teal-dim)" />
        <StatCard icon="◆" value={`${overview.successRate}%`} label="Match Success Rate" change={5}
          accentColor="var(--accent-green)" accentDim="var(--accent-green-dim)" />
        <StatCard icon="◇" value={overview.avgMatchScore} label="Avg AI Score" change={-2}
          accentColor="var(--accent-lavender)" accentDim="var(--accent-lavender-dim)" />
        <StatCard icon="⊕" value={overview.completedNeeds} label="Completed Tasks" change={18}
          accentColor="var(--accent-amber)" accentDim="var(--accent-amber-dim)" />
      </div>

      {/* Two-col layout */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Recent Needs */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>Recent Needs</div>
              <div className="text-muted text-sm">Click "Match" to find top volunteers</div>
            </div>
            <a href="/needs" className="btn btn-ghost btn-sm">View all →</a>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Need</th>
                  <th>Urgency</th>
                  <th>Status</th>
                  <th>Time</th>
                  <th>Skills</th>
                </tr>
              </thead>
              <tbody>
                {mockNeeds.slice(0, 4).map(need => (
                  <NeedRow key={need.id} need={need} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Match Panel */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>AI Matching Engine</div>
              <div className="text-muted text-sm">Select a need to run AI scoring</div>
            </div>
            {selectedNeed && (
              <span className="badge badge-assigned" style={{ fontSize: 11 }}>{selectedNeed.title.slice(0, 20)}…</span>
            )}
          </div>

          {/* Need selector */}
          {!selectedNeed ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {mockNeeds.filter(n => n.status === 'open').map(need => (
                <div
                  key={need.id}
                  className="card"
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  onClick={() => handleTriggerMatch(need)}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{need.title}</div>
                    <div className="text-muted text-sm">{need.category} · {need.urgency}</div>
                  </div>
                  <button className="btn btn-primary btn-sm">⚡ Match</button>
                </div>
              ))}
            </div>
          ) : loading ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
              <div style={{ color: 'var(--text-secondary)' }}>Running AI scoring algorithm…</div>
              <div className="text-muted text-sm" style={{ marginTop: 4 }}>
                Evaluating {mockVolunteers.length}+ volunteers
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {matches.map((match, i) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  rank={i + 1}
                  onAssign={() => handleAssign(match)}
                />
              ))}
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => { setSelectedNeed(null); setMatches([]); }}
                style={{ marginTop: 4 }}
              >
                ← Back to needs
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid-3">
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 12, fontFamily: 'var(--font-display)' }}>🔥 Top Categories</div>
          {Object.entries(mockAnalytics.categoryDistribution).map(([cat, count]) => (
            <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div className="text-muted text-sm" style={{ width: 110, textTransform: 'capitalize' }}>{cat}</div>
              <div className="score-bar" style={{ flex: 1 }}>
                <div className="score-bar-fill" style={{ width: `${(count / 15) * 100}%`, background: 'var(--accent-teal)' }} />
              </div>
              <div className="text-sm" style={{ width: 20, textAlign: 'right', color: 'var(--text-secondary)' }}>{count}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 12, fontFamily: 'var(--font-display)' }}>⭐ Top Volunteers</div>
          {mockAnalytics.topVolunteers.slice(0, 4).map((v, i) => (
            <div key={v.name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div className={`match-rank ${['rank-1','rank-2','rank-3','rank-other'][i] || 'rank-other'}`}
                   style={{ fontSize: 14, width: 20, fontFamily: 'var(--font-display)', fontWeight: 800 }}>
                {['🥇','🥈','🥉','4'][i]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{v.name}</div>
                <div className="text-muted text-sm">{v.completedTasks} tasks · ⭐ {v.rating}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 12, fontFamily: 'var(--font-display)' }}>📊 This Week</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Needs Created', val: 7, max: 15, color: 'var(--accent-amber)' },
              { label: 'Matches Made', val: 11, max: 20, color: 'var(--accent-teal)' },
              { label: 'Tasks Completed', val: 5, max: 10, color: 'var(--accent-green)' },
              { label: 'Response Rate', val: 89, max: 100, color: 'var(--accent-lavender)', suffix: '%' },
            ].map(item => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span className="text-muted text-sm">{item.label}</span>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{item.val}{item.suffix || ''}</span>
                </div>
                <div className="score-bar">
                  <div className="score-bar-fill"
                    style={{ width: `${(item.val / item.max) * 100}%`, background: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
