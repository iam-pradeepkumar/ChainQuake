import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, RotateCcw, CloudLightning, Truck, 
  Factory, Bug, Flame, AlertTriangle, Send,
  ShieldCheck, Radio, Search
} from 'lucide-react';
import { simulateApi, riskApi } from '../services/api';
import { toast } from 'react-hot-toast';

const EVENTS = [
  { type: 'natural_disaster', label: 'Cyclone / Flood', icon: CloudLightning, color: '#ef4444' },
  { type: 'supplier_failure', label: 'Supplier Outage', icon: Factory, color: '#f59e0b' },
  { type: 'labor_dispute', label: 'Labor Strike', icon: Truck, color: '#f59e0b' },
  { type: 'infrastructure', label: 'Grid Failure', icon: Zap, color: '#3b82f6' },
  { type: 'cyber', label: 'Cyber Intrusion', icon: Bug, color: '#8b5cf6' },
  { type: 'pandemic', label: 'Bio-Hazard', icon: Flame, color: '#ef4444' },
];

export default function SimulationPanel({ onSimulate, onReset, simResult, loading, userEmail }) {
  const [selected, setSelected] = useState(null);
  const [testStatus, setTestStatus] = useState(null);

  const handleTestNotify = async () => {
    setTestStatus('sending');
    const toastId = toast.loading("Testing Communication Link...");
    try {
      await simulateApi.testNotify({
        notify_email: userEmail,
        notify_phone: "+916385388984"
      });
      setTestStatus('sent');
      toast.success("Alert Link Verified.", { id: toastId });
      setTimeout(() => setTestStatus(null), 3000);
    } catch (e) {
      setTestStatus('error');
      toast.error("Alert Link Failed.", { id: toastId });
      setTimeout(() => setTestStatus(null), 3000);
    }
  };

  const handleSyncData = async () => {
    if(window.confirm("This will synchronize live asset data from the Tamil Nadu sector. Proceed?")) {
      const toastId = toast.loading("Synchronizing Intelligence...");
      try {
        await riskApi.reseed();
        toast.success("Intelligence Synchronized.", { id: toastId });
        window.location.reload();
      } catch(e) {
        toast.error("Synchronization failed.", { id: toastId });
      }
    }
  };

  return (
    <div className="sim-panel">
      <div className="panel-header">
        <div className="header-info">
          <Radio size={16} className="pulse-purple" />
          <span className="title">CRISIS SIMULATOR</span>
        </div>
        <button onClick={handleSyncData} className="sync-btn">
          <Search size={12} /> SYNC ASSETS
        </button>
      </div>

      <p className="panel-desc">Select a disruption vector to initiate stress-test simulation across the regional network.</p>

      {/* Event Types Grid */}
      <div className="events-grid">
        {EVENTS.map(ev => (
          <motion.button 
            key={ev.type} 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelected(ev.type)} 
            className={`event-card ${selected === ev.type ? 'active' : ''}`}
            style={{ '--active-color': ev.color }}
          >
            <ev.icon size={24} color={selected === ev.type ? ev.color : '#444'} />
            <span className="label">{ev.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="action-stack">
        <button 
          className={`execute-btn ${loading ? 'loading' : ''}`}
          disabled={!selected || loading} 
          onClick={() => selected && onSimulate({ event_type: selected })}
        >
          {loading ? (
            <div className="loading-state">
              <div className="scanner" />
              SIMULATING DISRUPTION...
            </div>
          ) : (
            <><Zap size={16} fill="white" /> EXECUTE DISRUPTION</>
          )}
        </button>

        <div className="button-row">
          <button onClick={onReset} className="reset-btn">
            <RotateCcw size={14} /> RESET
          </button>
          <button 
            onClick={handleTestNotify} 
            disabled={testStatus === 'sending'}
            className={`test-btn ${testStatus}`}
          >
            <Send size={14} /> {testStatus === 'sending' ? 'SENDING...' : 'TEST ALERTS'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .sim-panel {
          background: #000;
          border-radius: 20px;
          border: 1px solid #111;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .header-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .title {
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 2px;
          color: #fff;
        }

        .panel-desc {
          font-size: 11px;
          color: #666;
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .sync-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid #222;
          color: #aaa;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 9px;
          font-weight: 900;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .events-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 24px;
        }

        .event-card {
          padding: 20px 16px;
          background: #080808;
          border: 1px solid #1a1a1a;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .event-card.active {
          background: rgba(255,255,255,0.03);
          border-color: var(--active-color);
          box-shadow: 0 0 20px rgba(0,0,0,0.5);
        }

        .event-card .label {
          font-size: 9px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #444;
        }

        .event-card.active .label { color: #fff; }

        .action-stack {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .execute-btn {
          height: 50px;
          background: #fff;
          color: #000;
          border: none;
          border-radius: 12px;
          font-weight: 900;
          font-size: 12px;
          letter-spacing: 1px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
        }

        .execute-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .execute-btn.loading { background: #111; color: #fff; }

        .scanner {
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.4), transparent);
          animation: scan 1.5s infinite;
        }

        @keyframes scan {
          0% { left: -100%; }
          100% { left: 200%; }
        }

        .button-row {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 12px;
        }

        .reset-btn, .test-btn {
          height: 40px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .reset-btn {
          background: #080808;
          border: 1px solid #1a1a1a;
          color: #888;
        }

        .test-btn {
          background: transparent;
          border: 1px solid #7c3aed;
          color: #7c3aed;
        }

        .test-btn:disabled { opacity: 0.5; }
        .test-btn.sent { border-color: #10b981; color: #10b981; }

        .pulse-purple {
          color: #7c3aed;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
