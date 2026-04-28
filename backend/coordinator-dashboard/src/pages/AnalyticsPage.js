// src/pages/AnalyticsPage.js
import React, { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { mockAnalytics } from '../utils/mockData';

const COLORS = ['#00d4b8', '#a78bfa', '#ffb347', '#ff6b6b', '#34d399', '#60a5fa'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-medium)',
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: 12,
    }}>
      {label && <div style={{ color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>{label}</div>}
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color || 'var(--text-primary)', display: 'flex', gap: 8 }}>
          <span>{p.name}:</span><strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const { overview, monthlyTrend, topVolunteers, categoryDistribution, skillDemand } = mockAnalytics;

  const categoryData = Object.entries(categoryDistribution).map(([name, value]) => ({ name, value }));
  const skillData = skillDemand.map(s => ({ name: s.skill, count: s.count }));

  const handleExport = () => {
    const csv = [
      ['Metric', 'Value'],
      ['Total Needs', overview.totalNeeds],
      ['Open Needs', overview.openNeeds],
      ['Completed Needs', overview.completedNeeds],
      ['Completion Rate', `${overview.completionRate}%`],
      ['Total Volunteers', overview.totalVolunteers],
      ['Match Success Rate', `${overview.successRate}%`],
      ['Avg Match Score', overview.avgMatchScore],
    ].map(r => r.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'volunteermatch-analytics.csv';
    a.click();
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Analytics</div>
          <div className="page-subtitle">Platform performance · April 2026</div>
        </div>
        <button className="btn btn-secondary" onClick={handleExport}>⊕ Export CSV</button>
      </div>

      {/* Overview KPIs */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        {[
          { label: 'Total Needs', val: overview.totalNeeds, color: 'var(--accent-coral)', dim: 'var(--accent-coral-dim)', icon: '◈' },
          { label: 'Completion Rate', val: `${overview.completionRate}%`, color: 'var(--accent-green)', dim: 'var(--accent-green-dim)', icon: '✓' },
          { label: 'Total Matches', val: overview.totalMatches, color: 'var(--accent-teal)', dim: 'var(--accent-teal-dim)', icon: '◎' },
          { label: 'Success Rate', val: `${overview.successRate}%`, color: 'var(--accent-amber)', dim: 'var(--accent-amber-dim)', icon: '⭐' },
          { label: 'Avg Match Score', val: overview.avgMatchScore, color: 'var(--accent-lavender)', dim: 'var(--accent-lavender-dim)', icon: '◇' },
        ].map(s => (
          <div key={s.label} className="stat-card"
            style={{ '--stat-accent': s.color, '--stat-accent-dim': s.dim }}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid-2" style={{ marginBottom: 20 }}>
        {/* Monthly Trend */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Monthly Activity Trend</div>
              <div className="chart-subtitle">Needs created vs tasks completed</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorNeeds" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4b8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00d4b8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
              <Area type="monotone" dataKey="needs" name="Needs" stroke="#00d4b8" strokeWidth={2}
                fill="url(#colorNeeds)" dot={{ fill: '#00d4b8', r: 3 }} />
              <Area type="monotone" dataKey="completions" name="Completions" stroke="#a78bfa" strokeWidth={2}
                fill="url(#colorComp)" dot={{ fill: '#a78bfa', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution Pie */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Need Categories</div>
              <div className="chart-subtitle">Distribution by type</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={75}
                  paddingAngle={3} dataKey="value">
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {categoryData.map((item, i) => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                  <span className="text-sm" style={{ flex: 1, textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{item.name}</span>
                  <span style={{ fontWeight: 700, fontSize: 12 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid-2" style={{ marginBottom: 20 }}>
        {/* Skill Demand Bar Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Skill Demand</div>
              <div className="chart-subtitle">Most requested volunteer skills</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={skillData} layout="vertical" margin={{ left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Demand" fill="#00d4b8" radius={[0, 4, 4, 0]} maxBarSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Volunteer Performance */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Top Volunteer Performance</div>
              <div className="chart-subtitle">By tasks completed</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topVolunteers} margin={{ top: 5, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 9 }} axisLine={false} tickLine={false}
                interval={0} angle={-30} textAnchor="end" />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="completedTasks" name="Tasks" radius={[4, 4, 0, 0]} maxBarSize={32}>
                {topVolunteers.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insights */}
      <div className="card">
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
          🤖 AI Insights
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {[
            { icon: '📈', title: 'Matching Efficiency Up', desc: 'Match success rate improved by 12% last month. Medical skill volunteers are highly in demand.', color: 'var(--accent-green)' },
            { icon: '⚠️', title: 'Skill Gap Detected', desc: 'Rescue and swimming skills are critically short. Consider outreach for specialized volunteers.', color: 'var(--accent-amber)' },
            { icon: '🎯', title: 'Engagement Insight', desc: 'Weekend volunteers have 22% higher completion rate. Schedule more tasks for weekends.', color: 'var(--accent-teal)' },
            { icon: '🏆', title: 'Retention High', desc: 'Volunteers with 5+ completed tasks have 94% return rate. Recognize top performers.', color: 'var(--accent-lavender)' },
          ].map(insight => (
            <div key={insight.title} style={{
              background: 'var(--bg-elevated)',
              border: `1px solid ${insight.color}30`,
              borderLeft: `3px solid ${insight.color}`,
              borderRadius: 'var(--radius-md)',
              padding: 14,
            }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{insight.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{insight.title}</div>
              <div className="text-muted text-sm">{insight.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
