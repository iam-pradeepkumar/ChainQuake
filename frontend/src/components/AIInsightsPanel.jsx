import React from 'react';
import { Brain, TrendingUp, ShieldCheck, AlertTriangle } from 'lucide-react';

const TYPE_ICON = { critical: AlertTriangle, warning: TrendingUp, info: ShieldCheck };
const TYPE_COLOR = { critical: 'var(--accent-red)', warning: 'var(--accent-amber)', info: 'var(--accent-cyan)' };

export default function AIInsightsPanel({ insights }) {
  const items = (insights || []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ 
          width: 32, height: 32, background: 'rgba(124, 58, 237, 0.1)', 
          borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' 
        }}>
          <Brain size={18} color="var(--accent-purple)" />
        </div>
        <span style={{ fontSize: 16, fontWeight: 950, color: 'var(--text-primary)', letterSpacing: 1 }}>COGNITIVE OVERLAY</span>
        <div style={{ marginLeft: 'auto', background: 'var(--accent-purple)', padding: '2px 8px', borderRadius: 20 }}>
           <span style={{ fontSize: 9, fontWeight: 900, color: 'white' }}>LIVE</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}>INITIALIZING AI ENGINE...</div>
        )}
        {items.map((insight, i) => {
          const color = insight.type === 'critical' ? '#ef4444' : (insight.type === 'warning' ? 'var(--accent-gold)' : 'var(--accent-purple)');
          return (
            <div key={i} className="animate-slide-in" style={{
              padding: '20px', background: 'var(--glass-bg)', borderRadius: 24,
              border: 'var(--border-subtle)', animationDelay: `${i * 0.1}s`,
            }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ 
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0, border: `1px solid ${color}40`
                }}>
                  <TrendingUp size={18} color={color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: 12 }}>{insight.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 12 }}>{insight.message}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ height: 4, flex: 1, background: 'var(--bg-obsidian)', borderRadius: 10, overflow: 'hidden' }}>
                      <div style={{ 
                        height: '100%', width: `${(insight.confidence || 0.5) * 100}%`,
                        background: color, borderRadius: 10, boxShadow: `0 0 10px ${color}` 
                      }} />
                    </div>
                    <span style={{ fontSize: 10, color: color, fontWeight: 900 }}>
                      {((insight.confidence || 0.5) * 100).toFixed(0)}% RELIABILITY
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
