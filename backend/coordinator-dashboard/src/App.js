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
import LandingPage from './pages/LandingPage';
import Sidebar from './components/Sidebar';

// Auth Context
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

function App() {
  const [theme, setTheme] = useState('dark');
  // Demo mode: null initially so it goes to landing
  const [user, setUser] = useState(null);

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  return (
    <AuthContext.Provider value={{ user }}>
      <div data-theme={theme} style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Router>
          {user ? (
          <div className="app-layout">
            <Sidebar theme={theme} onToggleTheme={toggleTheme} user={user} />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/needs" element={<NeedsPage />} />
                <Route path="/volunteers" element={<VolunteersPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
          ) : (
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage onLogin={setUser}/>} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          )}
        </Router>
      </div>
    </AuthContext.Provider>
  );
}

export default App;
