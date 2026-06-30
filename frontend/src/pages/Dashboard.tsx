import React from 'react';
import StatCard from '../components/ui/StatCard';
import TrafficChart from '../components/charts/TrafficChart';
import AIChatBar from '../components/ui/AIChatBar';

const Dashboard: React.FC = () => {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 style={{ marginBottom: '8px' }}>Overview</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Your web traffic performance at a glance.</p>
      </header>

      <AIChatBar />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        <StatCard title="Total Visitors" value="12,450" trend="+15%" isPositive={true} />
        <StatCard title="Page Views" value="45,000" trend="+12%" isPositive={true} />
        <StatCard title="Bounce Rate" value="45.2%" trend="-2.1%" isPositive={true} />
        <StatCard title="Avg. Visit Duration" value="2m 14s" trend="-5s" isPositive={false} />
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>Traffic Trends</h3>
        <div style={{ height: '350px' }}>
          <TrafficChart />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
