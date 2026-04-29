"""
Simulation Engine - What-if scenarios and self-healing
"""
from backend.core.seed_data import DISRUPTION_TEMPLATES
import random, copy


class SimulationEngine:
    def __init__(self):
        self.history = []

    def run_disruption(self, graph_engine, event_type=None, location=None, custom_event=None):
        """Run a disruption simulation"""
        graph_engine.reset_risks()

        if custom_event:
            template = {
                "event": custom_event, "type": event_type or "custom",
                "severity": "high", "affected_cities": [location or "Chennai"],
                "impact_factor": 0.65
            }
        elif event_type:
            matches = [t for t in DISRUPTION_TEMPLATES if t["type"] == event_type]
            template = random.choice(matches) if matches else random.choice(DISRUPTION_TEMPLATES)
        else:
            template = random.choice(DISRUPTION_TEMPLATES)

        affected_node_ids = graph_engine.get_by_city(template["affected_cities"])
        all_affected = []
        for nid in affected_node_ids:
            result = graph_engine.propagate_risk(nid, template["impact_factor"])
            all_affected.extend(result)

        # Deduplicate
        seen = set()
        unique = []
        for a in all_affected:
            if a["id"] not in seen:
                seen.add(a["id"])
                unique.append(a)

        health = graph_engine.get_health()
        timeline = self._build_timeline(unique, template)

        record = {
            "event": template["event"], "type": template.get("type", "custom"),
            "severity": template["severity"],
            "affected_cities": template["affected_cities"],
            "affected_nodes": unique, "health_after": health, "timeline": timeline
        }
        self.history.append(record)
        return record

    def _build_timeline(self, affected, template):
        timeline = []
        for i, node in enumerate(sorted(affected, key=lambda x: x["depth"])):
            timeline.append({
                "time": f"+{node['depth'] * 15}min",
                "event": f"{node['name']} risk → {node['risk_score']*100:.0f}%",
                "severity": node["status"], "depth": node["depth"]
            })
        return timeline

    def get_recovery_plan(self, graph_engine, affected_nodes):
        """Generate a self-healing recovery plan"""
        plan = []
        for node in affected_nodes:
            if node.get("status") == "critical":
                alts = graph_engine.find_alternates(node["id"])
                plan.append({
                    "failed_node": node["name"], "failed_id": node["id"],
                    "action": "reroute", "alternatives": alts[:3],
                    "estimated_recovery": f"{random.randint(2, 48)}h",
                    "priority": "critical"
                })
            elif node.get("status") == "at_risk":
                plan.append({
                    "failed_node": node["name"], "failed_id": node["id"],
                    "action": "monitor_and_prepare",
                    "alternatives": graph_engine.find_alternates(node["id"])[:2],
                    "estimated_recovery": f"{random.randint(1, 12)}h",
                    "priority": "medium"
                })
        return plan


simulation_engine = SimulationEngine()
