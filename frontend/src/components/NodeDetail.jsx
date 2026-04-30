import React from 'react';
import { motion } from 'framer-motion';
import { 
  X, Navigation, Info, AlertTriangle, Compass, 
  MapPin, Package, BarChart3, Shield, Zap
} from 'lucide-react';

export default function NodeDetail({ node, onClose }) {
  if (!node) return null;

  const STATUS_COLORS = {
    operational: '#10b981',
    at_risk: '#facc15',
    critical: '#ef4444',
    offline: '#64748b',
  };

  const handleAction = (type, label) => {
    console.log(`Action initiated: ${type} for ${node.name}`);
    // Future integration: Link to specific tactical reports
  };

  return (
    <div className="node-detail-root">
      {/* Detail Header */}
      <div className="detail-header" style={{ '--status-color': STATUS_COLORS[node.status] }}>
        <button onClick={onClose} className="close-btn"><X size={20} /></button>
        
        <div className="header-intel">
          <div className="node-avatar">
             <Shield size={32} color={STATUS_COLORS[node.status]} />
          </div>
          <div className="node-meta">
            <span className="node-id">TN-{node.id?.toString().padStart(4, '0')}</span>
            <h2 className="node-name">{node.name}</h2>
          </div>
        </div>

        <div className="status-badge" style={{ background: `${STATUS_COLORS[node.status]}22`, color: STATUS_COLORS[node.status], borderColor: `${STATUS_COLORS[node.status]}44` }}>
           {node.status?.toUpperCase()}
        </div>
      </div>

      <div className="detail-content">
        {/* Quick Actions */}
        <div className="action-grid">
          {[
            { icon: Navigation, label: 'ROUTE', type: 'route' },
            { icon: Info, label: 'LOGS', type: 'logs' },
            { icon: AlertTriangle, label: 'AUDIT', type: 'audit' },
            { icon: Zap, label: 'HEAL', type: 'mitigation' }
          ].map((item, i) => (
            <button key={i} onClick={() => handleAction(item.type, item.label)} className="action-tile">
              <div className="tile-icon"><item.icon size={18} /></div>
              <span className="tile-label">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Intelligence Dossier */}
        <section className="dossier-section">
          <h4 className="section-title">INTELLIGENCE DOSSIER</h4>
          <div className="dossier-card">
            {node.description || "Strategic intelligence monitoring active. Autonomous asset verification in progress."}
          </div>
        </section>

        {/* Asset Metrics */}
        <section className="metrics-section">
          <h4 className="section-title">ASSET METRICS</h4>
          <div className="metrics-list">
            {[
              { label: 'Sector', value: node.sector, icon: MapPin },
              { label: 'Tier', value: node.type, icon: Package },
              { label: 'Risk Profile', value: `${((node.current_risk || 0) * 100).toFixed(1)}%`, icon: BarChart3 }
            ].map((m, idx) => (
              <div key={idx} className="metric-item">
                <div className="metric-icon"><m.icon size={16} /></div>
                <div className="metric-info">
                  <span className="m-label">{m.label}</span>
                  <span className="m-value">{m.value}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Risk Trajectory */}
        <div className="risk-trajectory-card">
           <div className="trajectory-header">
              <span className="t-label">RISK TRAJECTORY</span>
              <span className="t-value" style={{ color: (node.current_risk || 0) > 0.6 ? '#ef4444' : '#3b82f6' }}>
                {((node.current_risk || 0) * 100).toFixed(1)}%
              </span>
           </div>
           <div className="chart-mock">
              {[0.2, 0.4, 0.3, 0.5, 0.4, 0.6, (node.current_risk || 0)].map((val, idx) => (
                <div 
                  key={idx} 
                  className="bar" 
                  style={{ 
                    height: `${Math.max(10, val * 100)}%`,
                    background: idx === 6 ? STATUS_COLORS[node.status] : 'rgba(255,255,255,0.05)'
                  }} 
                />
              ))}
           </div>
           <button className="mitigation-btn">
              GENERATE MITIGATION PLAN
           </button>
        </div>
      </div>

      <style jsx>{`
        .node-detail-root {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: #080808;
          color: #fff;
          font-family: 'Outfit', sans-serif;
        }

        .detail-header {
          padding: 40px 32px;
          border-bottom: 1px solid #1a1a1a;
          position: relative;
          background: linear-gradient(to bottom, var(--status-color) 0%, transparent 100%);
          background-size: 100% 4px;
          background-repeat: no-repeat;
        }

        .close-btn {
          position: absolute;
          top: 24px;
          right: 24px;
          background: rgba(255,255,255,0.05);
          border: 1px solid #222;
          color: #888;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .header-intel {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
        }

        .node-avatar {
          width: 64px;
          height: 64px;
          background: rgba(0,0,0,0.4);
          border: 1px solid #222;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .node-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .node-id {
          font-size: 10px;
          font-weight: 900;
          color: #555;
          letter-spacing: 2px;
        }

        .node-name {
          font-size: 24px;
          font-weight: 950;
          letter-spacing: -0.5px;
        }

        .status-badge {
          display: inline-flex;
          padding: 6px 16px;
          border-radius: 100px;
          font-size: 10px;
          font-weight: 950;
          border: 1px solid transparent;
          letter-spacing: 1px;
        }

        .detail-content {
          flex: 1;
          overflow-y: auto;
          padding: 32px;
        }

        .action-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 40px;
        }

        .action-tile {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          cursor: pointer;
        }

        .tile-icon {
          width: 44px;
          height: 44px;
          background: #111;
          border: 1px solid #1a1a1a;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #7c3aed;
          transition: all 0.3s;
        }

        .action-tile:hover .tile-icon {
          background: #7c3aed;
          color: #fff;
          border-color: #7c3aed;
        }

        .tile-label {
          font-size: 9px;
          font-weight: 900;
          color: #555;
        }

        .section-title {
          font-size: 10px;
          font-weight: 900;
          color: #444;
          letter-spacing: 2px;
          margin-bottom: 16px;
        }

        .dossier-card {
          padding: 20px;
          background: #000;
          border: 1px solid #111;
          border-radius: 16px;
          font-size: 14px;
          color: #aaa;
          line-height: 1.6;
          margin-bottom: 32px;
        }

        .metrics-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 32px;
        }

        .metric-item {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .metric-icon {
          width: 36px;
          height: 36px;
          background: #000;
          border: 1px solid #111;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #7c3aed;
        }

        .metric-info {
          display: flex;
          flex-direction: column;
        }

        .m-label { font-size: 9px; font-weight: 900; color: #444; text-transform: uppercase; }
        .m-value { font-size: 14px; font-weight: 700; color: #eee; }

        .risk-trajectory-card {
          padding: 24px;
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.05) 0%, transparent 100%);
          border-radius: 20px;
          border: 1px solid rgba(124, 58, 237, 0.1);
        }

        .trajectory-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .t-label { font-size: 11px; font-weight: 900; color: #fff; }
        .t-value { font-size: 12px; font-weight: 950; }

        .chart-mock {
          height: 60px;
          display: flex;
          align-items: flex-end;
          gap: 4px;
          margin-bottom: 24px;
        }

        .bar { flex: 1; border-radius: 4px 4px 2px 2px; }

        .mitigation-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #7c3aed, #3b82f6);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 900;
          cursor: pointer;
          letter-spacing: 1px;
          box-shadow: 0 10px 30px rgba(124, 58, 237, 0.2);
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; }
      `}</style>
    </div>
  );
}
