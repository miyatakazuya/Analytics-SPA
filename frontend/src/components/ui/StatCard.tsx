import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  isPositive?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, isPositive }) => {
  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{title}</h3>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
        <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</span>
        {trend && (
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: isPositive ? 'var(--success)' : 'var(--danger)' }}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
