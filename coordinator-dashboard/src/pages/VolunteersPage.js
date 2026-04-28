// src/pages/VolunteersPage.js
import React, { useState } from 'react';
import { mockVolunteers } from '../utils/mockData';

function Stars({ rating }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`star ${i <= Math.round(rating) ? '' : 'empty'}`}>★</span>
      ))}
    </div>
  );
}

function VolunteerDetailModal({ volunteer, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Volunteer Profile</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {/* Avatar + Name */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
            <div className="match-avatar" style={{ width: 60, height: 60, fontSize: 22 }}>
              {volunteer.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20 }}>{volunteer.name}</div>
              <div className="text-muted text-sm">📍 {volunteer.location.address}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <Stars rating={volunteer.rating} />
                <span style={{ fontWeight: 700 }}>{volunteer.rating}</span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Tasks Done', val: volunteer.completedTasks, icon: '✓' },
              { label: 'Response Rate', val: `${volunteer.responseRate}%`, icon: '⚡' },
              { label: 'Rating', val: volunteer.rating, icon: '⭐' },
            ].map(s => (
              <div key={s.label} style={{
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                textAlign: 'center',
                border: '1px solid var(--border-subtle)',
              }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20 }}>{s.val}</div>
                <div className="text-muted text-sm">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div style={{ marginBottom: 16 }}>
            <div className="form-label">Skills</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {volunteer.skills.map(s => (
                <span key={s} className="skill-chip" style={{
                  padding: '4px 10px',
                  border: '1px solid var(--accent-teal)',
                  color: 'var(--accent-teal)',
                  background: 'var(--accent-teal-dim)',
                }}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div style={{ marginBottom: 16 }}>
            <div className="form-label">Availability</div>
            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{
                padding: '4px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                background: volunteer.availability.weekdays ? 'var(--accent-green-dim)' : 'var(--bg-hover)',
                color: volunteer.availability.weekdays ? 'var(--accent-green)' : 'var(--text-muted)',
                border: `1px solid ${volunteer.availability.weekdays ? 'var(--accent-green)' : 'var(--border-medium)'}`,
              }}>
                {volunteer.availability.weekdays ? '✓' : '✗'} Weekdays
              </span>
              <span style={{
                padding: '4px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                background: volunteer.availability.weekends ? 'var(--accent-green-dim)' : 'var(--bg-hover)',
                color: volunteer.availability.weekends ? 'var(--accent-green)' : 'var(--text-muted)',
                border: `1px solid ${volunteer.availability.weekends ? 'var(--accent-green)' : 'var(--border-medium)'}`,
              }}>
                {volunteer.availability.weekends ? '✓' : '✗'} Weekends
              </span>
            </div>
            {volunteer.availability.flexibleHours?.length > 0 && (
              <div className="text-muted text-sm" style={{ marginTop: 6 }}>
                ⏱ {volunteer.availability.flexibleHours.map(h => `${h.startTime}–${h.endTime}`).join(', ')}
              </div>
            )}
          </div>

          {/* Contact */}
          <div>
            <div className="form-label">Contact</div>
            <div className="text-muted text-sm">📞 {volunteer.phone}</div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={() => alert(`Notification sent to ${volunteer.name}!`)}>
            📨 Send Message
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VolunteersPage() {
  const [volunteers] = useState(mockVolunteers);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('');

  const allSkills = [...new Set(volunteers.flatMap(v => v.skills))].sort();

  const filtered = volunteers.filter(v => {
    const matchesSearch = !search || v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.location.address.toLowerCase().includes(search.toLowerCase());
    const matchesSkill = !skillFilter || v.skills.includes(skillFilter);
    return matchesSearch && matchesSkill;
  });

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Volunteers</div>
          <div className="page-subtitle">{filtered.length} of {volunteers.length} volunteers</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input
          className="form-input"
          placeholder="Search by name or location..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 280 }}
        />
        <select
          className="form-select"
          value={skillFilter}
          onChange={e => setSkillFilter(e.target.value)}
          style={{ maxWidth: 200 }}
        >
          <option value="">All Skills</option>
          {allSkills.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {(search || skillFilter) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setSkillFilter(''); }}>
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Volunteer</th>
              <th>Skills</th>
              <th>Rating</th>
              <th>Tasks</th>
              <th>Response Rate</th>
              <th>Availability</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(v => (
              <tr key={v.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(v)}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="match-avatar" style={{ width: 36, height: 36, fontSize: 12 }}>
                      {v.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{v.name}</div>
                      <div className="text-muted text-sm">📍 {v.location.address.split(',')[0]}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {v.skills.slice(0, 2).map(s => <span key={s} className="skill-chip">{s}</span>)}
                    {v.skills.length > 2 && <span className="skill-chip">+{v.skills.length - 2}</span>}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Stars rating={v.rating} />
                    <span style={{ fontWeight: 600, fontSize: 12 }}>{v.rating}</span>
                  </div>
                </td>
                <td>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{v.completedTasks}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="score-bar" style={{ width: 60 }}>
                      <div className="score-bar-fill"
                        style={{ width: `${v.responseRate}%`, background: v.responseRate >= 90 ? 'var(--accent-green)' : v.responseRate >= 70 ? 'var(--accent-amber)' : 'var(--accent-coral)' }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{v.responseRate}%</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {v.availability.weekdays && <span className="badge badge-open" style={{ fontSize: 10, padding: '2px 6px' }}>WD</span>}
                    {v.availability.weekends && <span className="badge badge-assigned" style={{ fontSize: 10, padding: '2px 6px' }}>WE</span>}
                  </div>
                </td>
                <td>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={e => { e.stopPropagation(); setSelected(v); }}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">◎</div>
            <div className="empty-state-title">No volunteers found</div>
            <div className="empty-state-desc">Try adjusting your search filters.</div>
          </div>
        )}
      </div>

      {selected && (
        <VolunteerDetailModal volunteer={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
