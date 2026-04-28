// volunteer-app/src/App.js
// Volunteer Mobile App - React (mobile-responsive web)
// Simulates the mobile app experience in a browser

import React, { useState } from 'react';
import './styles/app.css';

// ── Screens ──────────────────────────────────────────────────────────────────
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import TasksScreen from './screens/TasksScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import LoginScreen from './screens/LoginScreen';

const NAV_ITEMS = [
  { id: 'home', icon: '◉', label: 'Home' },
  { id: 'tasks', icon: '◈', label: 'Tasks' },
  { id: 'notifications', icon: '🔔', label: 'Alerts' },
  { id: 'profile', icon: '◎', label: 'Profile' },
];

export default function App() {
  const [screen, setScreen] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [unreadCount] = useState(2);

  if (!isLoggedIn) return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;

  const screens = {
    home: <HomeScreen />,
    tasks: <TasksScreen />,
    notifications: <NotificationsScreen />,
    profile: <ProfileScreen />,
  };

  return (
    <div className="app-shell">
      {/* Status Bar */}
      <div className="status-bar">
        <span>9:41</span>
        <span>📶 🔋</span>
      </div>

      {/* Screen content */}
      <div className="screen-content">
        {screens[screen]}
      </div>

      {/* Bottom Nav */}
      <nav className="bottom-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`nav-tab ${screen === item.id ? 'active' : ''}`}
            onClick={() => setScreen(item.id)}
          >
            <span className="tab-icon">
              {item.icon}
              {item.id === 'notifications' && unreadCount > 0 && (
                <span className="notif-dot">{unreadCount}</span>
              )}
            </span>
            <span className="tab-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
