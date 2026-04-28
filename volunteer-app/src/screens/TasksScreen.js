// volunteer-app/src/screens/TasksScreen.js
import React, { useState } from 'react';

const TASKS = [
  {
    id: 't1', title: 'Mental Health Counseling', status: 'active',
    location: 'Deccan, Pune', urgency: 'urgent', estimatedHours: 2,
    acceptedAt: '2 hours ago', category: 'mental-health',
    coordinator: 'Sarah Kumar', coordinatorPhone: '+91 98765 43210',
  },
  {
    id: 't2', title: 'Food Distribution Drive', status: 'completed',
    location: 'Hadapsar, Pune', urgency: 'planned', estimatedHours: 5,
    acceptedAt: 'Yesterday', completedAt: 'Yesterday', category: 'food-aid',
    coordinator: 'Rahul Mehta', rating: 5, feedback: 'Excellent work! Very professional.',
  },
  {
    id: 't3', title: 'Emergency First Aid Support', status: 'completed',
    location: 'Shivajinagar, Pune', urgency: 'immediate', estimatedHours: 4,
    acceptedAt: '3 days ago', completedAt: '3 days ago', category: 'medical',
    coordinator: 'Priya Nair', rating: 4,
  },
];

function Stars({ rating, editable, onRate }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          className={`star ${i <= rating ? 'filled' : 'empty'}`}
          onClick={() => editable && onRate && onRate(i)}
        >★</span>
      ))}
    </div>
  );
}

function FeedbackModal({ task, onClose }) {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [photo, setPhoto] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20,
      }}>
        <div style={{ background: 'white', borderRadius: 24, padding: 32, textAlign: 'center', maxWidth: 300 }}>
          <div style={{ fontSize: 50, marginBottom: 12 }}>🎉</div>
          <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 6 }}>Task Complete!</div>
          <div style={{ color: 'var(--text-2)', fontSize: 13, marginBottom: 20 }}>
            Thank you for your service. Your feedback has been recorded.
          </div>
          <button className="btn btn-primary btn-full" onClick={onClose}>Done</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100,
    }}>
      <div style={{
        background: 'white', borderRadius: '24px 24px 0 0',
        padding: '20px 20px 40px', width: '100%', maxWidth: 390,
      }}>
        <div style={{ width: 40, height: 4, background: '#e2e8f0', borderRadius: 2, margin: '0 auto 16px' }} />
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>Rate Your Experience</div>
        <div style={{ color: 'var(--text-2)', fontSize: 13, marginBottom: 20 }}>{task.title}</div>

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--text-2)' }}>
            How was this volunteer experience?
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            {[1, 2, 3, 4, 5].map(i => (
              <span key={i} onClick={() => setRating(i)}
                style={{
                  fontSize: 36, cursor: 'pointer', transition: 'transform 0.1s',
                  transform: i <= rating ? 'scale(1.2)' : 'scale(1)',
                  color: i <= rating ? '#f59e0b' : '#e2e8f0',
                }}>
                ★
              </span>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <textarea
            className="input"
            placeholder="Any feedback for the coordinator? (optional)"
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            style={{ resize: 'none', minHeight: 80 }}
          />
        </div>

        <button
          className="btn btn-secondary btn-full"
          style={{ marginBottom: 10 }}
          onClick={() => setPhoto('proof.jpg')}
        >
          📷 {photo ? '✓ Photo Uploaded' : 'Upload Proof Photo'}
        </button>

        <button
          className="btn btn-primary btn-full"
          onClick={() => setSubmitted(true)}
        >
          Submit & Complete Task
        </button>
      </div>
    </div>
  );
}

export default function TasksScreen() {
  const [activeTab, setActiveTab] = useState('active');
  const [feedbackTask, setFeedbackTask] = useState(null);

  const filtered = TASKS.filter(t => t.status === (activeTab === 'active' ? 'active' : 'completed'));

  return (
    <div className="screen fade-up">
      <div className="screen-header">
        <div className="screen-title">My Tasks</div>
        <div className="screen-subtitle">Track your volunteer commitments</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', padding: '0 16px', gap: 8, marginBottom: 16 }}>
        {['active', 'history'].map(tab => (
          <button
            key={tab}
            className={`btn btn-sm ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`}
            style={{ textTransform: 'capitalize', flex: 1 }}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'active' ? '⚡ Active' : '📋 History'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-2)' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>{activeTab === 'active' ? '◈' : '📋'}</div>
          <div style={{ fontWeight: 700 }}>
            {activeTab === 'active' ? 'No active tasks' : 'No history yet'}
          </div>
        </div>
      ) : (
        filtered.map(task => (
          <div key={task.id} className={`task-card ${task.urgency}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{task.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-2)' }}>📍 {task.location}</div>
              </div>
              {task.status === 'completed' ? (
                <span className="badge badge-green">✓ Done</span>
              ) : (
                <span className="badge badge-amber">● Active</span>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-2)', marginBottom: 12 }}>
              <span>⏱ {task.estimatedHours}h</span>
              <span>👤 {task.coordinator}</span>
              <span>📅 {task.acceptedAt}</span>
            </div>

            {task.rating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Stars rating={task.rating} />
                {task.feedback && (
                  <span style={{ fontSize: 12, color: 'var(--text-2)', fontStyle: 'italic' }}>
                    "{task.feedback}"
                  </span>
                )}
              </div>
            )}

            {task.status === 'active' && (
              <div style={{ display: 'flex', gap: 8 }}>
                {task.coordinator && (
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                    📞 Call Coordinator
                  </button>
                )}
                <button
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => setFeedbackTask(task)}
                >
                  ✓ Mark Complete
                </button>
              </div>
            )}
          </div>
        ))
      )}

      {feedbackTask && (
        <FeedbackModal task={feedbackTask} onClose={() => setFeedbackTask(null)} />
      )}
    </div>
  );
}
