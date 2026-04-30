import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield, Activity, AlertCircle, RefreshCw, LogOut, 
  Settings, User, Map as MapIcon, Database, Terminal,
  Zap, Globe, ChevronRight, BarChart3, Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import NetworkMap from '../components/NetworkMap';
import AlertsPanel from '../components/AlertsPanel';
import NodeDetail from '../components/NodeDetail';
import SimulationPanel from '../components/SimulationPanel';
import ChatCommander from '../components/ChatCommander';
import { riskApi, simulateApi } from '../services/api';

export default function Dashboard({ user, onLogout }) {
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simLoading, setSimLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('intelligence');

  const loadData = useCallback(async (isSilent = false) => {
    if(!isSilent) setLoading(true);
    try {
      const res = await riskApi.getGraph();
      setNodes(res.data.nodes || []);
      setLinks(res.data.links || []);
    } catch (e) {
      toast.error("Failed to synchronize network data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const ws = new WebSocket(`wss://${window.location.host}/ws/intelligence`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'REFRESH_ALL') loadData(true);
    };
    return () => ws.close();
  }, [loadData]);

  const handleSimulate = async (params) => {
    setSimLoading(true);
    const toastId = toast.loading("Simulating Network Disruption...");
    try {
      const res = await simulateApi.run({
        ...params,
        notify_email: user?.email,
        notify_phone: "+916385388984"
      });
      setSimResult(res.data);
      
      // OPTIMIZATION: Instant state hydration
      if (res.data.affected_nodes) {
        const affectedMap = new Map(res.data.affected_nodes.map(n => [n.id, n]));
        setNodes(prev => prev.map(node => {
          const update = affectedMap.get(node.id);
          return update ? { ...node, ...update } : node;
        }));
      }
      toast.success("Simulation Complete. Notifications Dispatched.", { id: toastId });
    } catch (e) {
      toast.error("Simulation sequence failed.", { id: toastId });
    } finally {
      setSimLoading(false);
    }
  };

  const handleReset = async () => {
    const toastId = toast.loading("Restoring Network Health...");
    try {
      await simulateApi.reset();
      setSimResult(null);
      await loadData(true);
      toast.success("Network Equilibrium Restored.", { id: toastId });
    } catch (e) {
      toast.error("Restoration failed.", { id: toastId });
    }
  };

  const networkHealth = Math.round(nodes.length > 0 
    ? (nodes.filter(n => n.status === 'healthy').length / nodes.length) * 100 
    : 100
  );

  if (loading) return (
    <div className="dashboard-loading">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="loading-content"
      >
        <Zap size={48} className="spin-slow" color="#7c3aed" />
        <p>DECRYPTING NETWORK LAYER...</p>
      </motion.div>
    </div>
  );

  return (
    <div className="dashboard-root">
      {/* Tactical Top Bar */}
      <nav className="tactical-nav">
        <div className="nav-brand">
          <Shield size={24} color="#7c3aed" fill="#7c3aed" />
          <span className="brand-text">CHAINQUAKE <span className="v-tag">v1.2.0</span></span>
        </div>

        <div className="nav-stats">
          <div className="stat-item">
            <div className="stat-label">NETWORK HEALTH</div>
            <div className={`stat-value ${networkHealth < 50 ? 'critical' : 'optimal'}`}>
              {networkHealth}%
            </div>
            <div className="health-bar-bg">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${networkHealth}%` }}
                 className="health-bar-fill"
               />
            </div>
          </div>
          <div className="divider" />
          <div className="stat-item">
            <div className="stat-label">OPERATOR</div>
            <div className="stat-value small">{user?.displayName}</div>
          </div>
        </div>

        <div className="nav-actions">
          <button className="icon-btn" title="Settings"><Settings size={18} /></button>
          <button className="icon-btn" title="Intelligence Alerts"><Bell size={18} /></button>
          <div className="user-profile">
             <div className="avatar">{user?.displayName?.[0]}</div>
             <button onClick={onLogout} className="logout-btn"><LogOut size={16} /></button>
          </div>
        </div>
      </nav>

      <div className="dashboard-main">
        {/* Left Sidebar - Tactical Intelligence */}
        <aside className="left-sidebar">
          <div className="sidebar-header">
            <div className="header-title"><Activity size={16} /> OPERATIONS</div>
          </div>
          <div className="sidebar-tabs">
            <button 
              className={`tab ${activeTab === 'intelligence' ? 'active' : ''}`}
              onClick={() => setActiveTab('intelligence')}
            >
              INTELLIGENCE
            </button>
            <button 
              className={`tab ${activeTab === 'alerts' ? 'active' : ''}`}
              onClick={() => setActiveTab('alerts')}
            >
              ALERTS
            </button>
          </div>
          
          <div className="sidebar-content-scroll">
            <AnimatePresence mode="wait">
              {activeTab === 'intelligence' ? (
                <motion.div 
                  key="intel"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <SimulationPanel 
                    onSimulate={handleSimulate} 
                    onReset={handleReset} 
                    simResult={simResult} 
                    loading={simLoading}
                    userEmail={user?.email}
                  />
                  <div style={{ marginTop: 24 }}>
                    <ChatCommander />
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="alerts"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <AlertsPanel />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </aside>

        {/* Center - Geospatial Intelligence */}
        <main className="map-container">
           <NetworkMap 
             graphData={{ nodes, links }}
             onNodeSelect={setSelectedNode} 
             selectedNode={selectedNode}
             theme="dark"
           />
           
           <div className="map-overlay-bottom">
              <div className="legend">
                 <div className="legend-item"><span className="dot healthy"></span> HEALTHY</div>
                 <div className="legend-item"><span className="dot at_risk"></span> AT RISK</div>
                 <div className="legend-item"><span className="dot critical"></span> CRITICAL</div>
              </div>
              <div className="map-status">
                 <Globe size={14} /> TAMIL NADU SECTOR ACTIVE
              </div>
           </div>
        </main>

        {/* Right Sidebar - Node Analytics (Dynamic) */}
        <AnimatePresence>
          {selectedNode && (
            <motion.aside 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="right-sidebar"
            >
              <NodeDetail 
                node={selectedNode} 
                onClose={() => setSelectedNode(null)} 
              />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .dashboard-root {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #050505;
          color: #fff;
          font-family: 'Outfit', sans-serif;
          overflow: hidden;
        }

        .tactical-nav {
          height: 70px;
          border-bottom: 1px solid #1a1a1a;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          background: rgba(10, 10, 10, 0.8);
          backdrop-filter: blur(20px);
          z-index: 100;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-text {
          font-weight: 950;
          font-size: 20px;
          letter-spacing: 4px;
          background: linear-gradient(135deg, #fff 0%, #888 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .v-tag {
          font-size: 9px;
          vertical-align: middle;
          background: rgba(124, 58, 237, 0.2);
          color: #7c3aed;
          padding: 2px 6px;
          border-radius: 4px;
          margin-left: 8px;
        }

        .nav-stats {
          display: flex;
          align-items: center;
          gap: 32px;
          background: rgba(255,255,255,0.03);
          padding: 10px 24px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-label {
          font-size: 9px;
          font-weight: 900;
          color: #555;
          letter-spacing: 1px;
        }

        .stat-value {
          font-size: 18px;
          font-weight: 900;
        }

        .stat-value.optimal { color: #10b981; }
        .stat-value.critical { color: #ef4444; }
        .stat-value.small { font-size: 14px; color: #aaa; }

        .health-bar-bg {
          width: 100px;
          height: 3px;
          background: rgba(255,255,255,0.1);
          border-radius: 2px;
          overflow: hidden;
        }

        .health-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #7c3aed, #3b82f6);
        }

        .dashboard-main {
          flex: 1;
          display: flex;
          overflow: hidden;
          position: relative;
        }

        .left-sidebar {
          width: 400px;
          border-right: 1px solid #1a1a1a;
          display: flex;
          flex-direction: column;
          background: #080808;
        }

        .sidebar-header {
          padding: 24px;
          border-bottom: 1px solid #1a1a1a;
        }

        .header-title {
          font-size: 11px;
          font-weight: 900;
          color: #888;
          display: flex;
          align-items: center;
          gap: 8px;
          letter-spacing: 2px;
        }

        .sidebar-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          padding: 8px;
          background: #000;
          margin: 16px;
          border-radius: 12px;
        }

        .tab {
          padding: 10px;
          border: none;
          background: none;
          color: #555;
          font-size: 11px;
          font-weight: 900;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.3s;
        }

        .tab.active {
          background: #111;
          color: #fff;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        }

        .sidebar-content-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 0 24px 24px;
        }

        .map-container {
          flex: 1;
          position: relative;
          background: #000;
        }

        .map-overlay-bottom {
          position: absolute;
          bottom: 24px;
          left: 24px;
          right: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          pointer-events: none;
        }

        .legend {
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(10px);
          padding: 12px 20px;
          border-radius: 14px;
          border: 1px solid #222;
          display: flex;
          gap: 20px;
          pointer-events: auto;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 10px;
          font-weight: 900;
          color: #aaa;
        }

        .dot { width: 8px; height: 8px; border-radius: 50%; }
        .dot.healthy { background: #10b981; box-shadow: 0 0 10px #10b981; }
        .dot.at_risk { background: #f59e0b; box-shadow: 0 0 10px #f59e0b; }
        .dot.critical { background: #ef4444; box-shadow: 0 0 10px #ef4444; }

        .map-status {
          background: rgba(124, 58, 237, 0.1);
          color: #7c3aed;
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 900;
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid rgba(124, 58, 237, 0.2);
        }

        .right-sidebar {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 450px;
          background: #0a0a0a;
          border-left: 1px solid #1a1a1a;
          z-index: 50;
          box-shadow: -20px 0 60px rgba(0,0,0,0.8);
        }

        .icon-btn {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          border: 1px solid #222;
          background: #000;
          color: #555;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
        }

        .icon-btn:hover {
          color: #fff;
          border-color: #444;
          background: #111;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-left: 12px;
          border-left: 1px solid #1a1a1a;
        }

        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #7c3aed;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 14px;
        }

        .logout-btn {
          background: none;
          border: none;
          color: #555;
          cursor: pointer;
          transition: color 0.3s;
        }

        .logout-btn:hover { color: #ef4444; }

        .dashboard-loading {
          height: 100vh;
          background: #050505;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loading-content {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }

        .loading-content p {
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 4px;
          color: #7c3aed;
        }

        .spin-slow {
          animation: spin 3s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #000;
        }
        ::-webkit-scrollbar-thumb {
          background: #222;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #333;
        }
      `}</style>
    </div>
  );
}
