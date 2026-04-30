import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, Compass, Loader2, AlertTriangle, Info } from 'lucide-react';

const TYPE_COLORS = {
  supplier: '#3b82f6',
  manufacturer: '#7c3aed',
  warehouse: '#06b6d4',
};

const STATUS_COLORS = {
  operational: '#10b981',
  at_risk: '#facc15',
  critical: '#ef4444',
  offline: '#64748b',
};

// Component to handle map centering/zooming dynamically
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Component to handle map state and zoom-aware rendering
function MapEvents({ onZoomChange }) {
  const map = useMap();
  useEffect(() => {
    const handleZoom = () => onZoomChange(map.getZoom());
    map.on('zoomend', handleZoom);
    return () => map.off('zoomend', handleZoom);
  }, [map, onZoomChange]);
  return null;
}

export default function NetworkMap({ graphData, onNodeSelect, selectedNode, theme }) {
  const [zoomLevel, setZoomLevel] = useState(7);
  
  // Tight Tamil Nadu Bounding Box
  const TN_BOUNDS = [[8.0, 76.2], [13.6, 80.4]];

  if (!graphData || !graphData.nodes) {
    return (
      <div className="grit-card" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <Loader2 className="animate-spin" size={40} color="var(--accent-purple)" />
        <p style={{ color: 'var(--text-muted)', fontWeight: 800, letterSpacing: 1 }}>SYNCHRONIZING SENSORS...</p>
      </div>
    );
  }

  const isDisruptionActive = graphData.nodes.some(n => n.status !== 'operational' || (n.risk || 0) > 0.3);

  // Pre-calculate relevant nodes for isolation mode
  const affectedNodeIds = new Set(
    graphData.nodes
      .filter(n => n.status !== 'operational' || (n.risk || 0) > 0.3)
      .map(n => n.id)
  );

  const relevantNodeIds = new Set(affectedNodeIds);
  graphData.links.forEach(link => {
    const sId = link.source.id || link.source;
    const tId = link.target.id || link.target;
    if (affectedNodeIds.has(sId)) relevantNodeIds.add(tId);
    if (affectedNodeIds.has(tId)) relevantNodeIds.add(sId);
  });

  // Create custom icons with ALWAYS VISIBLE labels and THIN style
  const createIcon = (node) => {
    const color = TYPE_COLORS[node?.type || 'supplier'];
    const isAffected = node?.status !== 'operational' || (node?.risk || 0) > 0.3;
    const isRelevant = relevantNodeIds.has(node?.id);
    const isCritical = node?.status === 'critical';
    
    // TOTAL ISOLATION: Hide nodes that are not relevant to the current disruption
    if (isDisruptionActive && !isRelevant) {
      return L.divIcon({ className: 'hidden-node', html: '' });
    }
    
    return L.divIcon({
      className: 'custom-node-icon',
      html: `
        <div style="
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        ">
          ${isCritical ? `
            <div style="
              position: absolute;
              width: 25px;
              height: 25px;
              border: 1.5px solid rgba(239, 68, 68, 0.4);
              border-radius: 50%;
              animation: ripple 2s infinite;
            "></div>
          ` : ''}
          
          <div style="
            width: ${node?.type === 'manufacturer' ? '10px' : '8px'};
            height: ${node?.type === 'manufacturer' ? '10px' : '8px'};
            background: ${isAffected ? STATUS_COLORS[node?.status] : color};
            border: 1px solid #fff;
            border-radius: 50%;
            box-shadow: 0 0 8px ${isAffected ? STATUS_COLORS[node?.status] : color};
          "></div>

          <div style="
            margin-top: 4px;
            padding: 2px 4px;
            background: ${theme === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)'};
            border-radius: 4px;
            color: ${isAffected ? (theme === 'dark' ? '#fff' : '#ef4444') : 'var(--text-primary)'};
            font-size: 8px;
            font-weight: 800;
            white-space: nowrap;
            pointer-events: none;
            border: 1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
          ">
            ${node?.name || ''}
          </div>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  // Convert graph data links to THIN polylines
  const polylines = graphData.links.map((link, idx) => {
    const sId = link?.source?.id || link?.source;
    const tId = link?.target?.id || link?.target;
    const source = graphData.nodes.find(n => n.id === sId);
    const target = graphData.nodes.find(n => n.id === tId);
    
    if (source && target) {
      const isSourceAffected = source.status !== 'operational' || (source.risk || 0) > 0.3;
      const isTargetAffected = target.status !== 'operational' || (target.risk || 0) > 0.3;
      const isConnectionAffected = isSourceAffected || isTargetAffected;
      
      if (isDisruptionActive && !isConnectionAffected) return null;

      const color = isConnectionAffected ? 
        (source.status === 'critical' || target.status === 'critical' ? '#ef4444' : 'var(--accent-gold)') : 
        (theme === 'dark' ? 'rgba(34, 211, 238, 0.4)' : '#334155'); // Darker slate for light mode

      return {
        positions: [[source.lat, source.lng], [target.lat, target.lng]],
        color: color,
        opacity: isConnectionAffected ? 0.9 : 0.6,
        weight: 1.5,
        dashArray: '4, 6',
        id: `link-${idx}`
      };
    }
    return null;
  }).filter(Boolean);

  return (
    <div style={{ flex: 1, height: '100%', width: '100%', position: 'relative', overflow: 'hidden', padding: 0, display: 'flex', flexDirection: 'column' }}>
      <MapContainer 
        center={[11.1271, 78.6569]} 
        zoom={7.5} 
        minZoom={7}
        maxBounds={TN_BOUNDS}
        maxBoundsViscosity={0.5}
        scrollWheelZoom={false}
        dragging={true}
        doubleClickZoom={true}
        style={{ flex: 1, width: '100%', background: '#000' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; Google Maps'
          url="http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
          subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
          className={theme === 'dark' ? 'satellite-dark' : 'satellite-light'}
        />
        
        <MapController center={selectedNode ? [selectedNode.lat, selectedNode.lng] : [11.1271, 78.6569]} zoom={selectedNode ? 9 : 7.5} />
        <MapEvents onZoomChange={setZoomLevel} />

        {polylines.map(line => (
          <Polyline 
            key={line.id}
            positions={line.positions}
            pathOptions={{
              color: line.color,
              weight: line.weight,
              opacity: line.opacity,
              dashArray: line.dashArray,
              lineCap: 'round'
            }}
          />
        ))}

        {graphData.nodes.map(node => (
          <Marker 
            key={node.id} 
            position={[node.lat, node.lng]} 
            icon={createIcon(node)}
            eventHandlers={{
              click: () => onNodeSelect(node)
            }}
          >
            <Popup className="custom-popup">
              <div style={{ padding: '8px', minWidth: '150px', background: 'var(--bg-surface)', borderRadius: '12px' }}>
                <div style={{ fontSize: '10px', color: STATUS_COLORS[node.status || 'operational'], fontWeight: 900, textTransform: 'uppercase', marginBottom: '4px' }}>{node.status || 'operational'}</div>
                <div style={{ fontSize: '14px', fontWeight: 900, color: 'var(--text-primary)' }}>{node.name}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: 4 }}>Dossier ID: TN-${node.id}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
