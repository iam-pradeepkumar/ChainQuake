import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import KPICards from '../components/KPICards';
import SupplyChainGraph from '../components/SupplyChainGraph';
import AlertsPanel from '../components/AlertsPanel';
import NewsFeed from '../components/NewsFeed';
import AIInsightsPanel from '../components/AIInsightsPanel';
import SimulationPanel from '../components/SimulationPanel';
import ChatCommander from '../components/ChatCommander';
import { riskApi, alertsApi, newsApi, simulateApi } from '../services/api';
import { Navigation, Compass, Info, AlertTriangle } from 'lucide-react';

export default function Dashboard({ user, onLogout }) {
  const [theme, setTheme] = useState('dark');
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [filteredGraphData, setFilteredGraphData] = useState({ nodes: [], links: [] });
  const [health, setHealth] = useState({});
  const [insights, setInsights] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [news, setNews] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [riskRes, alertsRes, newsRes] = await Promise.all([
        riskApi.getData().catch(() => ({ data: {} })),
        alertsApi.getAll().catch(() => ({ data: [] })),
        newsApi.getAll().catch(() => ({ data: [] })),
      ]);
      if (riskRes.data.graph) {
        setGraphData(riskRes.data.graph);
        setFilteredGraphData(riskRes.data.graph);
      }
      if (riskRes.data.health) setHealth(riskRes.data.health);
      if (riskRes.data.insights) setInsights(riskRes.data.insights);
      setAlerts(Array.isArray(alertsRes.data) ? alertsRes.data : []);
      setNews(Array.isArray(newsRes.data) ? newsRes.data : []);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  }, []);

  // WebSocket for Real-Time Intelligence
  useEffect(() => {
    let socket;
    const connectWS = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host === 'localhost:5173' ? 'localhost:8000' : window.location.host}/ws/intelligence`;
      
      socket = new WebSocket(wsUrl);
      
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Tactical Intelligence Received:", data);
        if (data.type === "REFRESH_ALL" || data.type === "SIMULATION_UPDATE" || data.type === "NEWS_UPDATE") {
          fetchAll();
        }
      };

      socket.onclose = () => {
        console.log("Neural Link Severed. Retrying in 5s...");
        setTimeout(connectWS, 5000);
      };
    };

    connectWS();
    return () => socket?.close();
  }, [fetchAll]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Reduced polling frequency since WebSockets are active
  useEffect(() => {
    const interval = setInterval(fetchAll, 60000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const handleSearch = (term) => {
    if (!term) {
      setFilteredGraphData(graphData);
      return;
    }
    const lower = term.toLowerCase();
    const filteredNodes = graphData.nodes.filter(n => 
      n.name.toLowerCase().includes(lower) || 
      n.city.toLowerCase().includes(lower) ||
      n.sector.toLowerCase().includes(lower)
    );
    // Keep links that connect filtered nodes
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredLinks = graphData.links.filter(l => 
      nodeIds.has(l.source.id || l.source) || nodeIds.has(l.target.id || l.target)
    );
    setFilteredGraphData({ nodes: filteredNodes, links: filteredLinks });
  };

  const handleSimulate = async (params) => {
    setSimLoading(true);
    try {
      const res = await simulateApi.run(params);
      setSimResult(res.data);
      // Refresh data after simulation
      await fetchAll();
    } catch (err) {
      console.error('Simulation error:', err);
    }
    setSimLoading(false);
  };

  const handleReset = async () => {
    try {
      await simulateApi.reset();
      setSimResult(null);
      await fetchAll();
    } catch (err) {
      console.error('Reset error:', err);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-obsidian)' }}>
      <Navbar 
        user={user} 
        onLogout={onLogout} 
        onSearch={handleSearch}
        theme={theme}
        setTheme={setTheme}
      />

      <main style={{ flex: 1, padding: '0 24px 24px', maxWidth: 1600, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* KPI Row */}
        <KPICards health={health} />

        {/* Main Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '20px', minHeight: 600 }}>
          {/* Left: Graph */}
          <div className="grit-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <SupplyChainGraph 
              graphData={filteredGraphData} 
              onNodeSelect={setSelectedNode} 
              selectedNode={selectedNode}
              theme={theme} 
            />
          </div>

          {/* Right: Simulation + Alerts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="grit-card" style={{ padding: 24 }}>
              <SimulationPanel
                onSimulate={handleSimulate} onReset={handleReset}
                simResult={simResult} loading={simLoading}
              />
            </div>
            <div className="grit-card" style={{ padding: 24, flex: 1, minHeight: 300 }}>
              <AlertsPanel alerts={alerts} />
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
          <div className="grit-card" style={{ padding: 24 }}>
            <AIInsightsPanel insights={insights} />
          </div>
          <div className="grit-card" style={{ padding: 24 }}>
            <NewsFeed news={news} />
          </div>
        </div>

        {/* Node Detail Intelligence Sidebar (GRIT STYLE) */}
        {selectedNode && (
          <div className="grit-card animate-slide-in" style={{
            position: 'fixed', top: 110, left: 30, width: 440, 
            height: 'calc(100vh - 140px)', zIndex: 2000, 
            padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column',
            background: 'var(--bg-surface)', border: '2px solid var(--accent-purple)',
            boxShadow: '0 0 80px rgba(0,0,0,0.2)'
          }}>
            {/* Header / Image Placeholder */}
            <div style={{ height: 200, background: `linear-gradient(135deg, ${selectedNode?.status === 'critical' ? '#450a0a' : 'var(--accent-purple)'} 0%, var(--bg-obsidian) 100%)`, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <button onClick={() => setSelectedNode(null)} style={{ position: 'absolute', top: 15, right: 15, background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', zIndex: 10 }}>×</button>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 80, height: 80, background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', border: 'var(--border-subtle)' }}>
                   <Compass size={40} color={selectedNode?.status === 'critical' ? '#ef4444' : (theme === 'dark' ? 'white' : 'var(--accent-purple)')} />
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2 }}>{`Intelligence ID: TN-${selectedNode?.id?.toString().padStart(4, '0') || '0000'}`}</div>
              </div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(transparent, var(--bg-surface))' }} />
            </div>

            <div style={{ padding: '0 24px 24px', flex: 1, overflowY: 'auto', color: 'var(--text-primary)' }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 26, fontWeight: 950, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.1 }}>{selectedNode?.name || 'Unknown Asset'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ background: selectedNode?.status === 'critical' ? '#ef4444' : '#10b981', padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 900, color: 'white' }}>{(selectedNode?.status || 'UNKNOWN').toUpperCase()}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}>{selectedNode?.city || 'Tamil Nadu'}, India</div>
                </div>
              </div>

              {/* Action Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 30 }}>
                {[
                  { icon: Navigation, label: 'Route' },
                  { icon: Info, label: 'Logs' },
                  { icon: AlertTriangle, label: 'Audit' },
                  { icon: Compass, label: 'Share' }
                ].map((item, i) => (
                  <button key={i} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-blue)' }}>
                      <item.icon size={18} />
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>{item.label}</span>
                  </button>
                ))}
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24 }}>
                <h4 style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 16, letterSpacing: 1 }}>ASSET INTELLIGENCE</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { label: 'Operational Sector', value: selectedNode?.sector, icon: '🏭' },
                    { label: 'Supply Tier', value: selectedNode?.type, icon: '📦' },
                    { label: 'Geographical Coordinates', value: `${selectedNode?.lat?.toFixed(4) || 0}, ${selectedNode?.lng?.toFixed(4) || 0}`, icon: '📍' },
                    { label: 'Base Risk Profile', value: `${((selectedNode?.base_risk || 0) * 100).toFixed(1)}%`, icon: '📊' }
                  ].map((info, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <div style={{ fontSize: 18 }}>{info.icon}</div>
                      <div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>{info.label}</div>
                        <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600, textTransform: 'capitalize' }}>{info.value || 'N/A'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 32, padding: 20, background: 'var(--glass-bg)', borderRadius: 16, border: 'var(--border-subtle)' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary)' }}>RISK TRAJECTORY</span>
                    <span style={{ fontSize: 11, fontWeight: 900, color: (selectedNode?.risk || 0) > 0.7 ? '#ef4444' : '#3b82f6' }}>
                      {((selectedNode?.risk || 0) * 100).toFixed(1)}%
                    </span>
                 </div>
                 <div style={{ height: 60, display: 'flex', alignItems: 'flex-end', gap: 3, marginBottom: 16 }}>
                    {[0.2, 0.4, 0.3, 0.5, 0.4, 0.6, (selectedNode?.risk || 0)].map((val, idx) => (
                      <div key={idx} style={{ flex: 1, height: `${val * 100}%`, background: idx === 6 ? (selectedNode?.status === 'critical' ? '#ef4444' : '#3b82f6') : 'var(--border-subtle)', borderRadius: '2px 2px 0 0' }} />
                    ))}
                 </div>
                 <button style={{ width: '100%', padding: '12px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: 12, fontSize: 12, fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 15px rgba(59,130,246,0.3)' }}>
                    GENERATE MITIGATION PLAN
                 </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Chat Commander */}
      <ChatCommander />
    </div>
  );
}
