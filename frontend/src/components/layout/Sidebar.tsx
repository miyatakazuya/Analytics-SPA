import React from 'react';
import { LayoutDashboard, FileText, Settings, LogOut, BarChart2 } from 'lucide-react';

const Sidebar: React.FC = () => {
  return (
    <div className="glass-panel" style={{ width: '280px', height: 'calc(100vh - 40px)', margin: '20px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
        <div style={{ background: 'var(--accent-glow)', padding: '8px', borderRadius: '8px' }}>
          <BarChart2 size={24} color="var(--accent-color)" />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Analytics</h2>
      </div>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: 'var(--text-primary)', textDecoration: 'none', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </a>
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: 'var(--text-secondary)', textDecoration: 'none', borderRadius: '8px', transition: 'background 0.2s' }}>
          <FileText size={20} />
          <span>Reports</span>
        </a>
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: 'var(--text-secondary)', textDecoration: 'none', borderRadius: '8px', transition: 'background 0.2s' }}>
          <Settings size={20} />
          <span>Settings</span>
        </a>
      </nav>

      <div style={{ marginTop: 'auto' }}>
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: 'var(--danger)', textDecoration: 'none', borderRadius: '8px' }}>
          <LogOut size={20} />
          <span>Logout</span>
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
