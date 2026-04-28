// volunteer-app/src/screens/HomeScreen.js
import React, { useState } from 'react';

const MOCK_MATCHES = [
  {
    id: 'm1', title: 'Emergency Medical Assistance',
    category: 'medical', urgency: 'immediate',
    location: 'Shivajinagar, Pune · 1.2 km away',
    estimatedHours: 4, aiScore: 91.5,
    requiredSkills: ['medical', 'first-aid'],
    description: 'Provide first aid support at community center after accident.',
    postedAgo: '30 min ago',
  },
  {
    id: 'm2', title: 'Children Education Support',
    category: 'education', urgency: 'planned',
    location: 'Pimpri, Pune · 3.8 km away',
    estimatedHours: 3, aiScore: 74.0,
    requiredSkills: ['teaching', 'communication'],
    description: 'Teach basic math and reading to underprivileged children.',
    postedAgo: '2 hrs ago',
  },
  {
    id: 'm3', title: 'Food Distribution Drive',
    category: 'food-aid', urgency: 'urgent',
    location: 'Hadapsar, Pune · 5.1 km away',
    estimatedHours: 6, aiScore: 67.5,
    requiredSkills: ['logistics', 'driving'],
    description: 'Help distribute meals to 500+ families in need.',
    postedAgo: '1 hr ago',
  },
];

const urgencyConfig = {
  immediate: { color: '#ef4444', label: '🔴 Immediate', cls: 'badge-red' },
  urgent: { color: '#f59e0b', label: '🟡 Urgent', cls: 'badge-amber' },
  planned: { color: '#00c896', label: '🟢 Planned', cls: 'badge-green' },
};

function TaskMatchCard({ match, onAccept, onDecline }) {
  const [expanded, setExpanded] = useState(false);
  const urg = urgencyConfig[match.urgency];

  return (
    <div className={`task-card ${match.urgency}`} onClick={() => setExpanded(e => !e)}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ flex: 1, paddingRight: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{match.title}</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6 }}>
            📍 {match.location}
          </div>
          <span className={`badge ${urg.cls}`}>{urg.label}</span>
        </div>
        <div className="ai-score">
          <div className="ai-score-val">{match.aiScore}</div>
          <div className="ai-score-label">AI Match</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
        {match.requiredSkills.map(s => (
          <span key={s} className="skill-pill">{s}</span>
        ))}
        <span style={{ fontSize: 11, color: 'var(--text-3)', alignSelf: 'center', marginLeft: 4 }}>
          ⏱ {match.estimatedHours}h
        </span>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, marginBottom: 10 }}>
          <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>{match.description}</p>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>Posted {match.postedAgo}</div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          className="btn btn-primary btn-sm"
          style={{ flex: 1 }}
          onClick={e => { e.stopPropagation(); onAccept(match); }}
        >
          ✓ Accept
        </button>
        <button
          className="btn btn-danger btn-sm"
          style={{ flex: 1 }}
          onClick={e => { e.stopPropagation(); onDecline(match); }}
        >
          ✗ Decline
        </button>
      </div>
    </div>
  );
}

export default function HomeScreen() {
  const [matches, setMatches] = useState(MOCK_MATCHES);
  const [accepted, setAccepted] = useState([]);

  const handleAccept = (match) => {
    setAccepted(a => [...a, match.id]);
    setMatches(m => m.filter(x => x.id !== match.id));
    alert(`✅ Accepted "${match.title}"!\nYou'll receive directions and coordinator contact details.`);
  };

  const handleDecline = (match) => {
    setMatches(m => m.filter(x => x.id !== match.id));
  };

  return (
    <div className="screen fade-up">
      {/* Hero Card */}
      <div style={{ padding: '0 16px 4px' }}>
        <div className="hero-card">
          <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 4, fontWeight: 600 }}>
            Good morning 👋
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>
            Ramesh Patel
          </div>
          <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 16 }}>
            {matches.length} new AI-matched opportunities waiting
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            {[
              { label: 'Completed', val: 15 },
              { label: 'Rating', val: '4.7 ⭐' },
              { label: 'This Month', val: 3 },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{s.val}</div>
                <div style={{ fontSize: 10, opacity: 0.8 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'flex', gap: 10, padding: '0 16px', marginBottom: 16 }}>
        {[
          { label: 'Rank', val: '#12', color: '#f59e0b' },
          { label: 'Points', val: '840', color: '#8b5cf6' },
          { label: 'Streak', val: '5🔥', color: '#ef4444' },
        ].map(s => (
          <div key={s.label} style={{
            flex: 1, background: 'var(--bg-card)', borderRadius: 12,
            padding: '10px 8px', textAlign: 'center',
            boxShadow: 'var(--shadow)', border: `1.5px solid ${s.color}20`,
          }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Matched Opportunities */}
      <div className="section-label">
        🤖 AI-Matched For You ({matches.length})
      </div>

      {matches.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-2)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>All caught up!</div>
          <div style={{ fontSize: 13 }}>You've responded to all your matches.</div>
        </div>
      ) : (
        matches.map(match => (
          <TaskMatchCard
            key={match.id}
            match={match}
            onAccept={handleAccept}
            onDecline={handleDecline}
          />
        ))
      )}
    </div>
  );
}
