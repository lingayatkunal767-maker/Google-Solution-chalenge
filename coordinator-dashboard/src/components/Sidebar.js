// src/components/Sidebar.js
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', icon: '◉', label: 'Dashboard' },
  { path: '/needs', icon: '◈', label: 'Community Needs', badge: 3 },
  { path: '/volunteers', icon: '◎', label: 'Volunteers' },
  { path: '/analytics', icon: '◇', label: 'Analytics' },
  { path: '/leaderboard', icon: '◆', label: 'Leaderboard' },
];

export default function Sidebar({ theme, onToggleTheme, user }) {
  const location = useLocation();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">🤝</div>
        <div>
          <div className="logo-text">VolunteerMatch</div>
          <div className="logo-badge">AI Platform</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Menu</div>
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
            {item.badge && (
              <span className="nav-badge">{item.badge}</span>
            )}
          </NavLink>
        ))}

        <div className="nav-section-label">Settings</div>
        <button
          className="nav-item"
          onClick={onToggleTheme}
          style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left' }}
        >
          <span className="nav-icon">{theme === 'dark' ? '☀' : '☾'}</span>
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <div className="nav-item">
          <span className="nav-icon">⊕</span>
          <span>Notifications</span>
        </div>
      </nav>

      {/* User footer */}
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            {user.displayName?.slice(0, 2).toUpperCase() || 'SC'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name truncate">{user.displayName || 'Coordinator'}</div>
            <div className="user-role">Coordinator</div>
          </div>
          <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>⊞</span>
        </div>
      </div>
    </aside>
  );
}
