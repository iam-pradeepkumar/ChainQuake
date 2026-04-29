import React from 'react';
import { Newspaper, ExternalLink, TrendingUp, AlertTriangle, Minus, Radio } from 'lucide-react';

export default function NewsFeed({ news }) {
  const items = (news || []).slice(0, 10);
  const liveCount = items.filter(n => n.live).length;

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
        {liveCount > 0 && (
          <div style={{
            marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(239, 68, 68, 0.1)', padding: '4px 12px', borderRadius: 20,
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            <Radio size={10} color="#ef4444" style={{ animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 9, fontWeight: 900, color: '#ef4444' }}>LIVE</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', flex: 1, paddingRight: 4 }}>
        {items.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}>
            CONNECTING TO INTELLIGENCE FEEDS...
          </div>
        )}
        {items.map((item, i) => {
          const color = item.impact === 'High' ? '#ef4444' : (item.impact === 'Medium' ? 'var(--accent-gold)' : 'var(--accent-purple)');
          const isLive = item.live;

          return (
            <a
              key={item.id || i}
              href={item.url && item.url !== '#' ? item.url : undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="animate-slide-in"
              style={{
                padding: '18px', background: 'var(--glass-bg)', borderRadius: 22,
                border: 'var(--border-subtle)', animationDelay: `${i * 0.08}s`,
                cursor: item.url && item.url !== '#' ? 'pointer' : 'default',
                transition: 'all 0.2s ease', textDecoration: 'none', display: 'block'
              }}
            >
              {/* Title */}
              <div style={{
                fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: 10,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
              }}>
                {item.title}
              </div>

              {/* Description */}
              {item.description && (
                <div style={{
                  fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 10,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                }}>
                  {item.description}
                </div>
              )}

              {/* Meta */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {isLive && (
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444', animation: 'pulse 2s infinite' }} />
                  )}
                  <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 800 }}>
                    {(item.source || '').toUpperCase()} · {(item.time || '').toUpperCase()}
                  </span>
                  {item.url && item.url !== '#' && (
                    <ExternalLink size={10} color="var(--text-muted)" />
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {item.category && item.category !== 'Global Intel' && (
                    <div style={{
                      padding: '2px 8px', borderRadius: 12, background: 'rgba(124,58,237,0.1)',
                      border: '1px solid rgba(124,58,237,0.2)'
                    }}>
                      <span style={{ fontSize: 8, fontWeight: 900, color: 'var(--accent-purple)' }}>
                        {item.category.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div style={{
                    padding: '3px 8px', borderRadius: 16, background: `${color}15`,
                    border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', gap: 4
                  }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: color }} />
                    <span style={{ fontSize: 8, fontWeight: 900, color: color }}>{(item.impact || '').toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
