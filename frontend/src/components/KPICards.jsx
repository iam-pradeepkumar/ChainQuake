import React from 'react';
import { TrendingUp, AlertTriangle, Shield, Activity, ArrowUp, ArrowDown } from 'lucide-react';

export default function KPICards({ health }) {
  const h = health || {};
  const healthScore = h.health_score ?? 0;
  const critical = h.critical ?? 0;
  const atRisk = h.at_risk ?? 0;
  const operational = h.operational ?? 0;
  const avgRisk = h.avg_risk ?? 0;
  const totalNodes = critical + atRisk + operational;

  const kpis = [
    {
      label: 'Network Integrity', value: `${healthScore}%`,
      icon: Shield, color: 'var(--accent-purple)',
      trend: healthScore >= 80 ? 'Optimal' : (healthScore >= 50 ? 'Degraded' : 'Compromised'),
      trendUp: healthScore >= 80,
      delta: healthScore >= 80 ? `+${(healthScore - 80).toFixed(1)}%` : `-${(80 - healthScore).toFixed(1)}%`
    },
    {
      label: 'Threat Vectors', value: `${critical + atRisk}`,
      icon: AlertTriangle, color: 'var(--accent-gold)',
      trend: `${critical} Critical / ${atRisk} Elevated`, trendUp: critical === 0,
      delta: critical > 0 ? `${critical} active` : 'Clear'
    },
    {
      label: 'Operational Nodes', value: `${totalNodes}`,
      icon: Activity, color: '#3b82f6',
      trend: `${operational} Active / ${totalNodes} Total`,
      trendUp: operational >= totalNodes * 0.8,
      delta: totalNodes > 0 ? `${((operational / totalNodes) * 100).toFixed(0)}% uptime` : '—'
    },
    {
      label: 'System Risk Index', value: `${(avgRisk * 100).toFixed(1)}%`,
      icon: TrendingUp, color: 'var(--accent-purple)',
      trend: avgRisk < 0.2 ? 'Nominal' : (avgRisk < 0.5 ? 'Elevated' : 'Critical'),
      trendUp: avgRisk < 0.3,
      delta: avgRisk < 0.3 ? 'Stable' : 'Escalating'
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
              <span style={{ fontSize: 10, fontWeight: 800, color: kpi.trendUp ? '#10b981' : '#ef4444' }}>{kpi.delta}</span>
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 950, color: 'var(--text-primary)', marginBottom: 4 }}>{kpi.value}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>{kpi.label}</div>
        </div>
      ))}
    </div>
  );
}
