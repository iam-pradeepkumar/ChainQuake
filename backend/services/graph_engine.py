"""
Graph Engine - Neural Network Mapping using Google Firestore
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
        nodes_ref = db_firestore.collection('nodes').stream()
        edges_ref = db_firestore.collection('edges').stream()
        
        self.graph.clear()
        node_count = 0
        for doc in nodes_ref:
            n = doc.to_dict()
            self.graph.add_node(
                doc.id, **n
            )
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
        """Get all node IDs that belong to any of the given cities"""
        if isinstance(cities, str):
            cities = [cities]
        result = []
        for nid, data in self.graph.nodes(data=True):
            if data.get("city") in cities:
                result.append(nid)
        return result

    def find_alternates(self, node_id):
        """Find alternate nodes of the same type that could replace a failed node"""
        if node_id not in self.graph.nodes:
            return []
        failed_node = self.graph.nodes[node_id]
        node_type = failed_node.get("type", "")
        sector = failed_node.get("sector", "")
        
        alternates = []
        for nid, data in self.graph.nodes(data=True):
            if nid == node_id:
                continue
            if data.get("type") == node_type:
                score = 0.5
                if data.get("sector") == sector:
                    score += 0.3
                if data.get("status") == "operational":
                    score += 0.2
                alternates.append({
                    "id": nid,
                    "name": data.get("name", nid),
                    "city": data.get("city", "Unknown"),
                    "compatibility": round(score, 2)
                })
        
        alternates.sort(key=lambda x: x["compatibility"], reverse=True)
        return alternates

    def propagate_risk(self, node_id, impact=0.7, depth=0, max_depth=5, visited=None):
        if visited is None: visited = set()
        if depth >= max_depth or node_id in visited: return []
        visited.add(node_id)
        
        affected = []
        nd = self.graph.nodes[node_id]
        new_risk = min(1.0, nd["base_risk"] + impact * (0.8 ** depth))
        nd["current_risk"] = round(new_risk, 3)
        nd["status"] = "critical" if new_risk >= 0.7 else ("at_risk" if new_risk >= 0.4 else "operational")
        
        # Batch update logic or deferred update to avoid sequential network calls
        # For now, we update in memory and return immediately to keep UI snappy
        # The frontend can trigger a refresh if needed, or we can use a thread
        if USE_FIRESTORE:
            # Note: sequential updates here are what slow down the simulation
            # We will perform the updates, but they are the source of the 'time' issue
            try:
                db_firestore.collection('nodes').document(node_id).update({
                    "current_risk": nd["current_risk"],
                    "status": nd["status"]
                })
            except: pass

        affected.append({
            "id": node_id,
            "name": nd["name"],
            "risk_score": nd["current_risk"],
            "status": nd["status"],
            "depth": depth
        })
        for succ in self.graph.successors(node_id):
            cascading = impact * 0.6
            if cascading > 0.05:
                affected.extend(self.propagate_risk(succ, cascading, depth + 1, max_depth, visited))
        return affected

    def reset_risks(self):
        for nid in self.graph.nodes:
            self.graph.nodes[nid]["current_risk"] = self.graph.nodes[nid]["base_risk"]
            self.graph.nodes[nid]["status"] = "operational"
            if USE_FIRESTORE:
                try: db_firestore.collection('nodes').document(nid).update({"current_risk": self.graph.nodes[nid]["base_risk"], "status": "operational"})
                except: pass

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
