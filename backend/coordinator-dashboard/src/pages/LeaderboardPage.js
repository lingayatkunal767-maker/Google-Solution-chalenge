// src/pages/LeaderboardPage.js
import React, { useState } from 'react';
import { mockVolunteers } from '../utils/mockData';

const BADGES = {
  1: { emoji: '🥇', label: 'Gold', color: '#ffd700', bg: 'rgba(255,215,0,0.12)' },
  2: { emoji: '🥈', label: 'Silver', color: '#c0c0c0', bg: 'rgba(192,192,192,0.12)' },
  3: { emoji: '🥉', label: 'Bronze', color: '#cd7f32', bg: 'rgba(205,127,50,0.12)' },
};

function getAchievementBadges(volunteer) {
  const badges = [];
  if (volunteer.completedTasks >= 20) badges.push({ icon: '⚡', label: 'Power Volunteer' });
  if (volunteer.rating >= 4.8) badges.push({ icon: '💎', label: 'Elite Rated' });
  if (volunteer.responseRate >= 95) badges.push({ icon: '🎯', label: 'Always Ready' });
  if (volunteer.skills.length >= 4) badges.push({ icon: '🛠', label: 'Multi-Skilled' });
  return badges;
}

function TopThreeCard({ volunteer, rank }) {
  const badge = BADGES[rank];
  const achievements = getAchievementBadges(volunteer);

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid ${badge.color}40`,
      borderRadius: 'var(--radius-xl)',
      padding: '28px 24px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s',
      transform: rank === 1 ? 'scale(1.04)' : 'scale(1)',
      boxShadow: rank === 1 ? `0 0 32px ${badge.color}25` : 'var(--shadow-card)',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
        background: badge.color,
      }} />
      <div style={{
        position: 'absolute', top: -40, right: -40,
        width: 120, height: 120,
        borderRadius: '50%',
        background: badge.bg,
        filter: 'blur(20px)',
      }} />

      {/* Rank badge */}
      <div style={{ fontSize: 36, marginBottom: 8 }}>{badge.emoji}</div>

      {/* Avatar */}
      <div style={{
        width: 68, height: 68,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${badge.color}80, ${badge.color}30)`,
        border: `3px solid ${badge.color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 12px',
        fontWeight: 800, fontSize: 22,
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-display)',
      }}>
        {volunteer.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
      </div>

      <div style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        fontSize: 18,
        marginBottom: 4,
      }}>
        {volunteer.name}
      </div>
      <div className="text-muted text-sm" style={{ marginBottom: 14 }}>
        📍 {volunteer.location.address.split(',')[0]}
      </div>

      {/* Key metrics */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: badge.color }}>
            {volunteer.completedTasks}
          </div>
          <div className="text-muted text-sm">Tasks</div>
        </div>
        <div style={{ width: 1, background: 'var(--border-subtle)' }} />
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22 }}>
            {volunteer.rating}
          </div>
          <div className="text-muted text-sm">Rating</div>
        </div>
        <div style={{ width: 1, background: 'var(--border-subtle)' }} />
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22 }}>
            {volunteer.responseRate}%
          </div>
          <div className="text-muted text-sm">Response</div>
        </div>
      </div>

      {/* Achievement badges */}
      {achievements.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
          {achievements.map(a => (
            <span key={a.label} title={a.label} style={{
              fontSize: 18, cursor: 'help',
            }}>{a.icon}</span>
          ))}
        </div>
      )}

      {/* Skills */}
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 4, marginTop: 12 }}>
        {volunteer.skills.slice(0, 3).map(s => (
          <span key={s} className="skill-chip">{s}</span>
        ))}
      </div>
    </div>
  );
}

function RankRow({ volunteer, rank }) {
  const achievements = getAchievementBadges(volunteer);
  return (
    <tr style={{ cursor: 'default' }}>
      <td>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 16,
          color: 'var(--text-muted)',
          width: 30,
          textAlign: 'center',
        }}>
          #{rank}
        </div>
      </td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="match-avatar" style={{ width: 36, height: 36, fontSize: 12 }}>
            {volunteer.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{volunteer.name}</div>
            <div className="text-muted text-sm">{volunteer.location.address.split(',')[0]}</div>
          </div>
        </div>
      </td>
      <td>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>
          {volunteer.completedTasks}
        </div>
      </td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ color: 'var(--accent-amber)' }}>★</span>
          <span style={{ fontWeight: 600 }}>{volunteer.rating}</span>
        </div>
      </td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="score-bar" style={{ width: 60 }}>
            <div className="score-bar-fill"
              style={{ width: `${volunteer.responseRate}%`, background: 'var(--accent-teal)' }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600 }}>{volunteer.responseRate}%</span>
        </div>
      </td>
      <td>
        <div style={{ display: 'flex', gap: 4 }}>
          {volunteer.skills.slice(0, 2).map(s => <span key={s} className="skill-chip">{s}</span>)}
          {volunteer.skills.length > 2 && <span className="skill-chip">+{volunteer.skills.length - 2}</span>}
        </div>
      </td>
      <td>
        <div style={{ display: 'flex', gap: 4 }}>
          {achievements.map(a => (
            <span key={a.label} title={a.label} style={{ fontSize: 14 }}>{a.icon}</span>
          ))}
        </div>
      </td>
    </tr>
  );
}

export default function LeaderboardPage() {
  const sorted = [...mockVolunteers].sort((a, b) => b.completedTasks - a.completedTasks);
  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  const [period, setPeriod] = useState('all-time');

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">🏆 Leaderboard</div>
          <div className="page-subtitle">Top performing volunteers</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['this-week', 'this-month', 'all-time'].map(p => (
            <button
              key={p}
              className={`btn btn-sm ${period === p ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setPeriod(p)}
              style={{ textTransform: 'capitalize' }}
            >
              {p.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 podium */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.1fr 1fr',
        gap: 16,
        marginBottom: 32,
        alignItems: 'end',
      }}>
        {/* Silver (2nd) */}
        <TopThreeCard volunteer={top3[1]} rank={2} />
        {/* Gold (1st) - center, slightly elevated */}
        <TopThreeCard volunteer={top3[0]} rank={1} />
        {/* Bronze (3rd) */}
        {top3[2] && <TopThreeCard volunteer={top3[2]} rank={3} />}
      </div>

      {/* Rest of the leaderboard */}
      {rest.length > 0 && (
        <>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 16,
            marginBottom: 14,
          }}>
            Other Rankings
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Volunteer</th>
                  <th>Tasks</th>
                  <th>Rating</th>
                  <th>Response Rate</th>
                  <th>Skills</th>
                  <th>Badges</th>
                </tr>
              </thead>
              <tbody>
                {rest.map((v, i) => (
                  <RankRow key={v.id} volunteer={v} rank={i + 4} />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Achievement Legend */}
      <div className="card" style={{ marginTop: 24 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 12 }}>
          🏅 Achievement Badges
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {[
            { icon: '⚡', label: 'Power Volunteer', desc: '20+ tasks completed' },
            { icon: '💎', label: 'Elite Rated', desc: '4.8+ average rating' },
            { icon: '🎯', label: 'Always Ready', desc: '95%+ response rate' },
            { icon: '🛠', label: 'Multi-Skilled', desc: '4+ skill categories' },
          ].map(b => (
            <div key={b.label} style={{
              display: 'flex', gap: 10, alignItems: 'center',
              background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)',
              padding: '10px 14px', border: '1px solid var(--border-subtle)',
            }}>
              <span style={{ fontSize: 22 }}>{b.icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{b.label}</div>
                <div className="text-muted text-sm">{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
