import React from 'react';
import { TrendingUp, AlertTriangle, Shield, Activity, ArrowUp, ArrowDown } from 'lucide-react';

export default function KPICards({ health }) {
  const h = health || {};
  const kpis = [
    {
      label: 'Network Integrity', value: `${h.health_score || 87}%`,
      icon: Shield, color: 'var(--accent-purple)',
      trend: h.health_score >= 80 ? 'Optimal' : 'Compromised', trendUp: h.health_score >= 80,
    },
    {
      label: 'Threat Vectors', value: `${(h.critical || 0) + (h.at_risk || 0)}`,
      icon: AlertTriangle, color: 'var(--accent-gold)',
      trend: `${h.critical || 0} Critical Alerts`, trendUp: false,
    },
    {
      label: 'Operational Nodes', value: `${h.total_nodes || 30}`,
      icon: Activity, color: '#3b82f6',
      trend: `${h.operational || 30} Active Assets`, trendUp: true,
    },
    {
      label: 'System Risk Index', value: `${((h.avg_risk || 0.13) * 100).toFixed(1)}%`,
      icon: TrendingUp, color: 'var(--accent-purple)',
      trend: 'Propagating Alerts', trendUp: (h.avg_risk || 0) < 0.3,
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
      {kpis.map((kpi, i) => (
        <div key={i} className="grit-card animate-slide-in" style={{
          padding: '24px', animationDelay: `${i * 0.1}s`, cursor: 'pointer',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.03)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.08)'
            }}>
              <kpi.icon size={22} color={kpi.color} />
            </div>
            <div style={{ 
              background: kpi.trendUp ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
              padding: '4px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 
            }}>
              {kpi.trendUp ? <ArrowUp size={12} color="#10b981" /> : <ArrowDown size={12} color="#ef4444" />}
              <span style={{ fontSize: 10, fontWeight: 800, color: kpi.trendUp ? '#10b981' : '#ef4444' }}>{kpi.trendUp ? '+2.4%' : '-1.2%'}</span>
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 950, color: 'var(--text-primary)', marginBottom: 4 }}>{kpi.value}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>{kpi.label}</div>
        </div>
      ))}
    </div>
  );
}
