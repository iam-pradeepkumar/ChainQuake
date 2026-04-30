"""
Graph Engine - Neural Network Mapping using Google Firestore
Optimized for high-performance batch updates and low-latency synchronization.
"""
import networkx as nx
import os
try:
    from backend.core.firebase_admin import db_firestore
    USE_FIRESTORE = True
except:
    USE_FIRESTORE = False

class GraphEngine:
    def __init__(self):
        self.graph = nx.DiGraph()
        self.sync_with_db()

    def sync_with_db(self):
        """Synchronize the in-memory graph with the persistent database (Priority: Firestore)"""
        if USE_FIRESTORE:
            try:
                self._sync_with_firestore()
                return
            except Exception as e:
                print(f"GRAPH ENGINE: Firestore Sync Failed ({e}).")
        else:
            print("GRAPH ENGINE: FIRESTORE NOT INITIALIZED.")

    def _sync_with_firestore(self):
        # Fetching all nodes and edges in parallel would be faster, but stream() is okay for now
        nodes_ref = db_firestore.collection('nodes').stream()
        edges_ref = db_firestore.collection('edges').stream()
        
        self.graph.clear()
        node_count = 0
        for doc in nodes_ref:
            n = doc.to_dict()
            self.graph.add_node(doc.id, **n)
            node_count += 1
            
        edge_count = 0
        for doc in edges_ref:
            e = doc.to_dict()
            self.graph.add_edge(e["source"], e["target"], latency=e.get("latency", 10.0))
            edge_count += 1
            
        print(f"GRAPH ENGINE: Synchronized {node_count} nodes and {edge_count} links from FIRESTORE.")

    def get_all_nodes(self):
        return [{"id": nid, **data} for nid, data in self.graph.nodes(data=True)]

    def get_all_edges(self):
        return [{"source": s, "target": t, "latency": d.get("latency", 10.0)}
                for s, t, d in self.graph.edges(data=True)]

    def get_graph_data(self):
        return {"nodes": self.get_all_nodes(), "links": self.get_all_edges()}

    def get_node(self, node_id):
        if node_id not in self.graph.nodes: return None
        data = dict(self.graph.nodes[node_id])
        data["id"] = node_id
        data["suppliers"] = list(self.graph.predecessors(node_id))
        data["customers"] = list(self.graph.successors(node_id))
        return data

    def get_by_city(self, cities):
        if isinstance(cities, str):
            cities = [cities]
        result = []
        for nid, data in self.graph.nodes(data=True):
            if data.get("city") in cities:
                result.append(nid)
        return result

    def find_alternates(self, node_id):
        if node_id not in self.graph.nodes: return []
        failed_node = self.graph.nodes[node_id]
        node_type = failed_node.get("type", "")
        sector = failed_node.get("sector", "")
        
        alternates = []
        for nid, data in self.graph.nodes(data=True):
            if nid == node_id: continue
            if data.get("type") == node_type:
                score = 0.5
                if data.get("sector") == sector: score += 0.3
                if data.get("status") == "operational": score += 0.2
                alternates.append({
                    "id": nid, "name": data.get("name", nid),
                    "city": data.get("city", "Unknown"), "compatibility": round(score, 2)
                })
        
        alternates.sort(key=lambda x: x["compatibility"], reverse=True)
        return alternates

    def run_batch_simulation(self, start_nodes, impact_factor):
        """
        High-performance simulation runner. 
        Calculates all cascading risks in-memory first, then flushes to Firestore in ONE batch.
        """
        visited = {} # node_id -> risk_info
        
        def propagate(node_id, current_impact, depth):
            if depth > 5 or node_id in visited and visited[node_id]['impact'] >= current_impact:
                return
            
            nd = self.graph.nodes[node_id]
            new_risk = min(1.0, nd["base_risk"] + current_impact * (0.8 ** depth))
            status = "critical" if new_risk >= 0.7 else ("at_risk" if new_risk >= 0.4 else "operational")
            
            visited[node_id] = {
                "id": node_id,
                "name": nd["name"],
                "risk_score": round(new_risk, 3),
                "status": status,
                "depth": depth,
                "impact": current_impact
            }
            
            for succ in self.graph.successors(node_id):
                propagate(succ, current_impact * 0.6, depth + 1)

        # Run in-memory propagation
        for nid in start_nodes:
            propagate(nid, impact_factor, 0)
            
        # Update in-memory graph and collect batch updates
        if USE_FIRESTORE:
            batch = db_firestore.batch()
            for nid, info in visited.items():
                self.graph.nodes[nid]["current_risk"] = info["risk_score"]
                self.graph.nodes[nid]["status"] = info["status"]
                
                node_ref = db_firestore.collection('nodes').document(nid)
                batch.update(node_ref, {
                    "current_risk": info["risk_score"],
                    "status": info["status"]
                })
            batch.commit()
            print(f"GRAPH ENGINE: Batch committed {len(visited)} node updates.")
        else:
            for nid, info in visited.items():
                self.graph.nodes[nid]["current_risk"] = info["risk_score"]
                self.graph.nodes[nid]["status"] = info["status"]

        return list(visited.values())

    def reset_risks(self):
        """Reset all risks to baseline using a single Firestore batch update"""
        if USE_FIRESTORE:
            batch = db_firestore.batch()
            for nid in self.graph.nodes:
                base = self.graph.nodes[nid]["base_risk"]
                self.graph.nodes[nid]["current_risk"] = base
                self.graph.nodes[nid]["status"] = "operational"
                
                node_ref = db_firestore.collection('nodes').document(nid)
                batch.update(node_ref, {
                    "current_risk": base,
                    "status": "operational"
                })
            batch.commit()
            print(f"GRAPH ENGINE: Batch reset {len(self.graph.nodes)} nodes.")
        else:
            for nid in self.graph.nodes:
                self.graph.nodes[nid]["current_risk"] = self.graph.nodes[nid]["base_risk"]
                self.graph.nodes[nid]["status"] = "operational"

    def get_health(self):
        nodes = list(self.graph.nodes(data=True))
        if not nodes: return {"health_score": 100}
        critical = sum(1 for _, d in nodes if d.get("status") == "critical")
        at_risk = sum(1 for _, d in nodes if d.get("status") == "at_risk")
        avg_risk = sum(d.get("current_risk", 0) for _, d in nodes) / len(nodes)
        return {
            "health_score": max(0, round((1 - avg_risk) * 100, 1)),
            "critical": critical, "at_risk": at_risk, "operational": len(nodes) - critical - at_risk,
            "avg_risk": round(avg_risk, 3)
        }

graph_engine = GraphEngine()
