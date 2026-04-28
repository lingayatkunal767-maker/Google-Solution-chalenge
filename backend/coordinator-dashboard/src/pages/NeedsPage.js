// src/pages/NeedsPage.js
import React, { useState } from 'react';
import { mockNeeds } from '../utils/mockData';

const CATEGORIES = ['medical', 'food-aid', 'education', 'disaster-relief', 'mental-health', 'logistics', 'general'];
const SKILLS_LIST = ['medical', 'first-aid', 'emergency-response', 'counseling', 'psychology', 'teaching',
  'logistics', 'driving', 'physical-labor', 'rescue', 'swimming', 'communication', 'child-care'];

function NeedCard({ need, onMatch }) {
  const urgencyColors = { immediate: 'var(--accent-coral)', urgent: 'var(--accent-amber)', planned: 'var(--accent-green)' };
  const statusClass = { open: 'badge-open', assigned: 'badge-assigned', completed: 'badge-completed' };

  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: urgencyColors[need.urgency],
      }} />
      <div style={{ paddingTop: 4 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ flex: 1, paddingRight: 10 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{need.title}</div>
            <div className="text-muted text-sm" style={{ marginBottom: 8 }}>{need.description}</div>
          </div>
          <span className={`badge ${statusClass[need.status]}`}>{need.status}</span>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {need.requiredSkills.map(s => <span key={s} className="skill-chip">{s}</span>)}
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
          <span className="text-muted text-sm">📍 {need.location?.address}</span>
          <span className="text-muted text-sm">⏱ {need.estimatedHours}h estimated</span>
          <span className="text-muted text-sm">🏷 {need.category}</span>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className={`badge badge-${need.urgency}`}>
            {need.urgency === 'immediate' ? '🔴' : need.urgency === 'urgent' ? '🟡' : '🟢'} {need.urgency}
          </span>
          <div style={{ flex: 1 }} />
          {need.status === 'open' && (
            <button className="btn btn-primary btn-sm" onClick={() => onMatch(need)}>
              ⚡ Find Volunteers
            </button>
          )}
          {need.status === 'assigned' && (
            <span className="text-muted text-sm">👤 Assigned</span>
          )}
          {need.status === 'completed' && (
            <span style={{ color: 'var(--accent-green)', fontSize: 12, fontWeight: 600 }}>✓ Completed</span>
          )}
        </div>
      </div>
    </div>
  );
}

function CreateNeedModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    title: '', description: '', category: 'general', urgency: 'planned',
    estimatedHours: 2, address: '', requiredSkills: [],
  });

  const toggleSkill = (skill) => {
    setForm(f => ({
      ...f,
      requiredSkills: f.requiredSkills.includes(skill)
        ? f.requiredSkills.filter(s => s !== skill)
        : [...f.requiredSkills, skill],
    }));
  };

  const handleSubmit = () => {
    if (!form.title || !form.description || !form.address) {
      alert('Please fill in all required fields.');
      return;
    }
    onCreate({
      ...form,
      id: `need_${Date.now()}`,
      location: { lat: 18.5204, lng: 73.8567, address: form.address },
      status: 'open',
      createdAt: new Date().toISOString(),
      createdBy: 'coord_demo',
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Create Community Need</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" placeholder="e.g. Emergency Medical Assistance"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea className="form-textarea" placeholder="Describe what volunteers need to do..."
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid-2" style={{ gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Urgency</label>
              <select className="form-select" value={form.urgency}
                onChange={e => setForm(f => ({ ...f, urgency: e.target.value }))}>
                <option value="planned">🟢 Planned</option>
                <option value="urgent">🟡 Urgent</option>
                <option value="immediate">🔴 Immediate</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Location Address *</label>
            <input className="form-input" placeholder="e.g. Pune Community Center, Shivajinagar"
              value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Estimated Hours</label>
            <input type="number" className="form-input" min={1} max={24}
              value={form.estimatedHours} onChange={e => setForm(f => ({ ...f, estimatedHours: Number(e.target.value) }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Required Skills</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
              {SKILLS_LIST.map(skill => (
                <button
                  key={skill}
                  className={`skill-chip`}
                  style={{
                    cursor: 'pointer',
                    border: form.requiredSkills.includes(skill)
                      ? '1px solid var(--accent-teal)'
                      : '1px solid var(--border-medium)',
                    background: form.requiredSkills.includes(skill)
                      ? 'var(--accent-teal-dim)'
                      : 'var(--bg-hover)',
                    color: form.requiredSkills.includes(skill)
                      ? 'var(--accent-teal)'
                      : 'var(--text-secondary)',
                    padding: '4px 10px',
                  }}
                  onClick={() => toggleSkill(skill)}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Create Need</button>
        </div>
      </div>
    </div>
  );
}

export default function NeedsPage() {
  const [needs, setNeeds] = useState(mockNeeds);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [matchNeed, setMatchNeed] = useState(null);

  const filtered = filter === 'all' ? needs : needs.filter(n => n.status === filter);

  const handleCreate = (newNeed) => {
    setNeeds(n => [newNeed, ...n]);
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Community Needs</div>
          <div className="page-subtitle">{filtered.length} needs · {needs.filter(n => n.status === 'open').length} open</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Create Need</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['all', 'open', 'assigned', 'completed'].map(f => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(f)}
            style={{ textTransform: 'capitalize' }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {filtered.map(need => (
          <NeedCard key={need.id} need={need} onMatch={setMatchNeed} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">◈</div>
          <div className="empty-state-title">No needs found</div>
          <div className="empty-state-desc">Create a new community need to get started.</div>
        </div>
      )}

      {showModal && (
        <CreateNeedModal onClose={() => setShowModal(false)} onCreate={handleCreate} />
      )}

      {matchNeed && (
        <div className="modal-overlay" onClick={() => setMatchNeed(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">⚡ AI Match Results</div>
              <button className="modal-close" onClick={() => setMatchNeed(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="badge badge-open" style={{ marginBottom: 12 }}>{matchNeed.title}</div>
              <p className="text-muted text-sm" style={{ marginBottom: 16 }}>
                Top 3 volunteers matched by AI scoring algorithm
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { name: 'Kavya Reddy', score: 91.5, skills: ['medical', 'first-aid'], rating: 4.9, tasks: 31 },
                  { name: 'Ramesh Patel', score: 84.0, skills: ['medical', 'counseling'], rating: 4.8, tasks: 23 },
                  { name: 'Priya Sharma', score: 72.0, skills: ['psychology'], rating: 4.6, tasks: 17 },
                ].map((v, i) => (
                  <div key={v.name} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: 12,
                    border: '1px solid var(--border-subtle)',
                  }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18,
                      color: i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : '#cd7f32' }}>
                      #{i + 1}
                    </div>
                    <div className="match-avatar" style={{ width: 38, height: 38, fontSize: 13 }}>
                      {v.name.split(' ').map(w => w[0]).join('')}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{v.name}</div>
                      <div className="text-muted text-sm">⭐ {v.rating} · {v.tasks} tasks</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--accent-teal)', fontSize: 18 }}>{v.score}</div>
                      <button className="btn btn-primary btn-sm" style={{ marginTop: 4 }}
                        onClick={() => { alert(`Assigned ${v.name}!`); setMatchNeed(null); }}>
                        Assign
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
