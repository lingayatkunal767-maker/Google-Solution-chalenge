// src/components/MatchCard.js
import React, { useState } from 'react';

function Stars({ rating }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`star ${i <= Math.round(rating) ? '' : 'empty'}`}>★</span>
      ))}
    </div>
  );
}

function MiniBar({ label, value, color }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</span>
        <span style={{ fontSize: 10, fontWeight: 700, color }}>{value}%</span>
      </div>
      <div className="score-bar" style={{ height: 4 }}>
        <div className="score-bar-fill" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

export default function MatchCard({ match, rank, onAssign }) {
  const [expanded, setExpanded] = useState(false);
  const rankClass = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : 'rank-other';
  const initials = match.volunteerName.split(' ').map(w => w[0]).join('').slice(0, 2);

  return (
    <div className="match-card" onClick={() => setExpanded(e => !e)}>
      <div className={`match-rank ${rankClass}`}>#{rank}</div>

      <div className="match-avatar">{initials}</div>

      <div className="match-info">
        <div className="match-name">{match.volunteerName}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <Stars rating={match.volunteerRating} />
          <span className="text-muted text-sm">{match.volunteerRating} · {match.completedTasks} tasks</span>
        </div>
        <div className="match-skills">
          {(match.volunteerSkills || []).slice(0, 3).map(s => (
            <span key={s} className="skill-chip">{s}</span>
          ))}
        </div>

        {expanded && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
            <div className="text-muted text-sm" style={{ marginBottom: 8, fontStyle: 'italic' }}>
              {match.explanation}
            </div>
            <MiniBar label="Skill Fit" value={match.scoreBreakdown.skillFit} color="var(--accent-teal)" />
            <MiniBar label="Availability" value={match.scoreBreakdown.availability} color="var(--accent-green)" />
            <MiniBar label="Location" value={match.scoreBreakdown.location} color="var(--accent-lavender)" />
            <MiniBar label="Interest" value={match.scoreBreakdown.interest} color="var(--accent-amber)" />
            <div className="text-muted text-sm" style={{ marginTop: 6 }}>
              📍 {match.volunteerLocation?.address} · {match.responseRate}% response rate
            </div>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', flexShrink: 0 }}>
        <div className="match-score-big">{match.score}</div>
        <div className="score-label">Score</div>
        <button
          className="btn btn-primary btn-sm"
          style={{ marginTop: 8, fontSize: 11 }}
          onClick={e => { e.stopPropagation(); onAssign(match); }}
        >
          Assign
        </button>
      </div>
    </div>
  );
}
