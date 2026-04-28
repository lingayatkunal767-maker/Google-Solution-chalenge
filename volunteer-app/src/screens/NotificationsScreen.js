// volunteer-app/src/screens/NotificationsScreen.js
import React, { useState } from 'react';

const NOTIFS = [
  {
    id: 'n1', type: 'match_alert', icon: '🤝', bg: '#f0fdf9', iconBg: '#dcfce7',
    title: 'New Match Found!',
    body: 'You\'ve been matched with "Flood Relief Operations" in Bhosari (AI Score: 88.5)',
    time: '5 min ago', isRead: false,
  },
  {
    id: 'n2', type: 'feedback_request', icon: '⭐', bg: '#fffbeb', iconBg: '#fef3c7',
    title: 'Rate Your Experience',
    body: 'How was the "Mental Health Counseling" task? Please share your feedback.',
    time: '2 hrs ago', isRead: false,
  },
  {
    id: 'n3', type: 'task_update', icon: '📋', bg: '#eff6ff', iconBg: '#dbeafe',
    title: 'Task Details Updated',
    body: 'Location for "Food Distribution Drive" has been updated to Hadapsar Road, Gate 3.',
    time: 'Yesterday', isRead: true,
  },
  {
    id: 'n4', type: 'achievement', icon: '🏆', bg: '#fdf4ff', iconBg: '#f3e8ff',
    title: 'Achievement Unlocked!',
    body: 'Congratulations! You\'ve earned the "Power Volunteer" badge for completing 15+ tasks.',
    time: '2 days ago', isRead: true,
  },
  {
    id: 'n5', type: 'match_alert', icon: '🤝', bg: 'white', iconBg: '#f1f5f9',
    title: 'Coordinator Assigned You',
    body: '"Emergency Medical Assistance" has been assigned to you by Sarah Kumar.',
    time: '3 days ago', isRead: true,
  },
];

export default function NotificationsScreen() {
  const [notifs, setNotifs] = useState(NOTIFS);

  const markAllRead = () => setNotifs(n => n.map(x => ({ ...x, isRead: true })));
  const unreadCount = notifs.filter(n => !n.isRead).length;

  return (
    <div className="screen fade-up">
      <div className="screen-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="screen-title">Notifications</div>
          {unreadCount > 0 && (
            <button
              style={{ fontSize: 12, color: 'var(--green)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={markAllRead}
            >
              Mark all read
            </button>
          )}
        </div>
        {unreadCount > 0 && (
          <div className="screen-subtitle">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</div>
        )}
      </div>

      <div style={{ background: 'white', borderRadius: 16, margin: '0 16px', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
        {notifs.map(n => (
          <div
            key={n.id}
            className={`notif-item ${!n.isRead ? 'unread' : ''}`}
            style={{ background: !n.isRead ? n.bg : 'white' }}
            onClick={() => setNotifs(ns => ns.map(x => x.id === n.id ? { ...x, isRead: true } : x))}
          >
            <div className="notif-icon" style={{ background: n.iconBg }}>
              {n.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontWeight: !n.isRead ? 700 : 600,
                fontSize: 13,
                marginBottom: 3,
                color: 'var(--text)',
              }}>
                {n.title}
                {!n.isRead && (
                  <span style={{
                    display: 'inline-block', width: 7, height: 7,
                    background: 'var(--green)', borderRadius: '50%',
                    marginLeft: 6, verticalAlign: 'middle',
                  }} />
                )}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.4 }}>{n.body}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 5 }}>{n.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
