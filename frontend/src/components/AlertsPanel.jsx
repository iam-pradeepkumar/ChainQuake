import React from 'react';
import { AlertCircle, ShieldAlert, Info, Clock } from 'lucide-react';

const ICONS = { critical: ShieldAlert, high: AlertCircle, medium: Info, low: Info };
const BADGE = { critical: 'badge-critical', high: 'badge-high', medium: 'badge-medium', low: 'badge-low' };

export default function AlertsPanel({ alerts }) {
  const items = (alerts || []).slice(0, 20); // More items since it's scrollable

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: 400 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertCircle size={20} color="var(--accent-purple)" fill="rgba(124, 58, 237, 0.2)" />
          <span style={{ fontSize: 16, fontWeight: 950, color: 'var(--text-primary)', letterSpacing: 1 }}>SYSTEM LOGS</span>
        </div>
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '4px 12px', borderRadius: 20, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <span style={{ fontSize: 10, fontWeight: 900, color: '#ef4444' }}>{items.filter(a => a.severity === 'critical').length} CRITICAL</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', flex: 1, paddingRight: 8, maxHeight: 320 }}>
        {items.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}>NO ACTIVE THREATS</div>
        )}
        {items.map((alert, i) => {
          const isCritical = alert.severity === 'critical';
          return (
            <div key={alert.id || i} className="animate-slide-in" style={{
              display: 'flex', gap: 14, padding: '16px', animationDelay: `${i * 0.05}s`,
              background: 'var(--glass-bg)', borderRadius: 20,
              border: isCritical ? '1px solid rgba(239, 68, 68, 0.3)' : 'var(--border-subtle)',
              transition: 'all 0.2s ease'
            }}>
              <div style={{ 
                width: 32, height: 32, borderRadius: '50%', 
                background: isCritical ? 'rgba(239, 68, 68, 0.1)' : 'rgba(124, 58, 237, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <ShieldAlert size={16} color={isCritical ? '#ef4444' : 'var(--accent-purple)'} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: 6 }}>{alert.message}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                   <div style={{ fontSize: 9, fontWeight: 900, color: isCritical ? '#ef4444' : 'var(--accent-gold)', textTransform: 'uppercase' }}>
                      {alert.severity}
                   </div>
                   <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} />
                      {alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString() : '—'}
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
