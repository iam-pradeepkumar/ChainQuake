import React, { useState } from 'react';
import { Zap, RotateCcw, MapPin, CloudLightning, Truck, Factory, Bug, Flame, AlertTriangle } from 'lucide-react';

const EVENTS = [
  { type: 'natural_disaster', label: 'Cyclone / Flood', icon: CloudLightning, color: 'var(--accent-red)' },
  { type: 'supplier_failure', label: 'Supplier Shutdown', icon: Factory, color: 'var(--accent-amber)' },
  { type: 'labor_dispute', label: 'Labor Strike', icon: Truck, color: 'var(--accent-amber)' },
  { type: 'infrastructure', label: 'Power Failure', icon: Zap, color: 'var(--accent-blue)' },
  { type: 'cyber', label: 'Cyber Attack', icon: Bug, color: 'var(--accent-purple)' },
  { type: 'pandemic', label: 'Pandemic', icon: Flame, color: 'var(--accent-red)' },
];

export default function SimulationPanel({ onSimulate, onReset, simResult, loading }) {
  const [selected, setSelected] = useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Zap size={22} color="var(--accent-gold)" fill="var(--accent-gold)" />
          <span style={{ fontSize: 16, fontWeight: 950, color: 'var(--text-primary)', letterSpacing: 1 }}>CRISIS SIMULATOR</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={async () => {
            if(window.confirm("This will overwrite current network data with real Tamil Nadu assets. Proceed?")) {
              try {
                const { riskApi } = await import('../services/api');
                await riskApi.reseed();
                window.location.reload();
              } catch(e) { alert("Sync failed: " + e.message); }
            }
          }} style={{ background: 'none', border: 'none', color: 'var(--accent-purple)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800 }}>
             SYNC REAL DATA
          </button>
          <button onClick={onReset} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800 }}>
            <RotateCcw size={14} /> RESET
          </button>
        </div>
      </div>

      {/* Event Types Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
        {EVENTS.map(ev => (
          <button 
            key={ev.type} 
            onClick={() => setSelected(ev.type)} 
            style={{
              padding: '16px 12px', 
              borderRadius: 20, 
              cursor: 'pointer',
              border: selected === ev.type ? `2px solid var(--accent-purple)` : 'var(--border-subtle)',
              background: selected === ev.type ? 'rgba(124, 58, 237, 0.1)' : 'var(--glass-bg)',
              color: selected === ev.type ? 'var(--text-primary)' : 'var(--text-muted)',
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: 10,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: selected === ev.type ? '0 0 20px rgba(124, 58, 237, 0.2)' : 'none'
            }}
          >
            <ev.icon size={22} color={selected === ev.type ? 'var(--accent-purple)' : 'var(--text-muted)'} />
            <span style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5 }}>{ev.label}</span>
          </button>
        ))}
      </div>

      {/* Trigger Button */}
      <button 
        className="pill-button gold-gradient" 
        disabled={!selected || loading} 
        style={{ width: '100%', justifyContent: 'center', opacity: selected ? 1 : 0.5 }} 
        onClick={() => selected && onSimulate({ event_type: selected })}
      >
        {loading ? 'SIMULATING...' : 'EXECUTE DISRUPTION'}
      </button>

      {/* Results View */}
      {simResult && (
        <div style={{ 
          marginTop: 24, padding: 20, background: 'rgba(239, 68, 68, 0.05)',
          borderRadius: 20, border: '1px solid rgba(239, 68, 68, 0.2)',
          animation: 'slideUp 0.4s ease'
        }}>
          <div style={{ fontSize: 14, fontWeight: 950, color: '#ef4444', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
             <AlertTriangle size={16} /> {simResult.event.toUpperCase()}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
             <div style={{ padding: 12, background: 'rgba(0,0,0,0.3)', borderRadius: 12, border: 'var(--border-subtle)' }}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontWeight: 800, marginBottom: 4 }}>SEVERITY</div>
                <div style={{ fontSize: 12, fontWeight: 900, color: 'white' }}>{simResult.severity.toUpperCase()}</div>
             </div>
             <div style={{ padding: 12, background: 'rgba(0,0,0,0.3)', borderRadius: 12, border: 'var(--border-subtle)' }}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontWeight: 800, marginBottom: 4 }}>NETWORK IMPACT</div>
                <div style={{ fontSize: 12, fontWeight: 900, color: 'white' }}>{(simResult.affected_nodes || []).length} NODES</div>
             </div>
          </div>

          <div style={{ marginTop: 16, fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>
             Predicted Network Health after impact: 
             <span style={{ color: 'var(--accent-gold)', marginLeft: 8, fontSize: 14, fontWeight: 950 }}>{simResult.health_after?.health_score || '—'}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
