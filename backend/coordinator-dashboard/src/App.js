// src/App.js
import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/globals.css';

// Pages
import Dashboard from './pages/Dashboard';
import NeedsPage from './pages/NeedsPage';
import VolunteersPage from './pages/VolunteersPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import LoginPage from './pages/LoginPage';
import Sidebar from './components/Sidebar';

// Auth Context
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

function App() {
  const [theme, setTheme] = useState('dark');
  // Demo mode: always logged in
  const [user] = useState({
    uid: 'coord_demo', email: 'coordinator@ngo.org',
    displayName: 'Sarah Coordinator', role: 'coordinator',
  });

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  return (
    <AuthContext.Provider value={{ user }}>
      <div data-theme={theme} style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Router>
          <div className="app-layout">
            {user && <Sidebar theme={theme} onToggleTheme={toggleTheme} user={user} />}
            <main className="main-content">
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<Dashboard />} />
                <Route path="/needs" element={<NeedsPage />} />
                <Route path="/volunteers" element={<VolunteersPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        </Router>
      </div>
    </AuthContext.Provider>
  );
}

export default App;
