import React from 'react';
import { Newspaper, ExternalLink, TrendingUp, AlertTriangle, Minus } from 'lucide-react';

const IMPACT_ICON = { High: AlertTriangle, Medium: TrendingUp, Low: Minus };
const IMPACT_COLOR = { High: 'var(--accent-red)', Medium: 'var(--accent-amber)', Low: 'var(--accent-green)' };

export default function NewsFeed({ news }) {
  const items = (news || []).slice(0, 10);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ 
          width: 32, height: 32, background: 'rgba(6, 182, 212, 0.1)', 
          borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' 
        }}>
          <Newspaper size={18} color="#06b6d4" />
        </div>
        <span style={{ fontSize: 16, fontWeight: 950, color: 'var(--text-primary)', letterSpacing: 1 }}>GLOBAL INTELLIGENCE</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', flex: 1, paddingRight: 4 }}>
        {items.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}>MONITORING GLOBAL FEEDS...</div>
        )}
        {items.map((item, i) => {
          const color = item.impact === 'High' ? '#ef4444' : (item.impact === 'Medium' ? 'var(--accent-gold)' : 'var(--accent-purple)');
          return (
            <div key={item.id || i} className="animate-slide-in" style={{
              padding: '20px', background: 'var(--glass-bg)', borderRadius: 24,
              border: 'var(--border-subtle)', animationDelay: `${i * 0.1}s`,
              cursor: 'pointer', transition: 'all 0.2s ease'
            }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: 12 }}>{item.title}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)' }} />
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800 }}>{(item.source || '').toUpperCase()} · {(item.time || '').toUpperCase()}</span>
                </div>
                <div style={{ 
                  padding: '4px 10px', borderRadius: 20, background: `${color}15`, 
                  border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', gap: 6 
                }}>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: color }} />
                  <span style={{ fontSize: 9, fontWeight: 900, color: color }}>{(item.impact || '').toUpperCase()} IMPACT</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
