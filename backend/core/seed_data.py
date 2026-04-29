"""
Seed data for ChainQuake - Realistic Tamil Nadu Supply Chain Network
"""

COMPANIES = [
    # === SUPPLIERS ===
    {"id": "S01", "name": "Sundaram Auto Components", "type": "supplier", "city": "Chennai", "sector": "Auto Parts", "lat": 13.0827, "lng": 80.2707, "base_risk": 0.15},
    {"id": "S02", "name": "TVS Electronics Ltd", "type": "supplier", "city": "Chennai", "sector": "Electronics", "lat": 13.0674, "lng": 80.2376, "base_risk": 0.10},
    {"id": "S03", "name": "Lakshmi Machine Works", "type": "supplier", "city": "Coimbatore", "sector": "Textile Machinery", "lat": 11.0168, "lng": 76.9558, "base_risk": 0.12},
    {"id": "S04", "name": "Roots Industries", "type": "supplier", "city": "Coimbatore", "sector": "Auto Parts", "lat": 11.0048, "lng": 76.9610, "base_risk": 0.18},
    {"id": "S05", "name": "Carborundum Universal", "type": "supplier", "city": "Chennai", "sector": "Abrasives & Ceramics", "lat": 13.0569, "lng": 80.2425, "base_risk": 0.08},
    {"id": "S06", "name": "Super Auto Forge", "type": "supplier", "city": "Hosur", "sector": "Forgings", "lat": 12.7409, "lng": 77.8253, "base_risk": 0.20},
    {"id": "S07", "name": "Shanthi Gears", "type": "supplier", "city": "Coimbatore", "sector": "Gears & Drives", "lat": 11.0250, "lng": 76.9800, "base_risk": 0.14},
    {"id": "S08", "name": "Precot Meridian", "type": "supplier", "city": "Coimbatore", "sector": "Raw Cotton & Yarn", "lat": 11.0120, "lng": 76.9420, "base_risk": 0.22},
    {"id": "S09", "name": "Rane Holdings", "type": "supplier", "city": "Chennai", "sector": "Steering Systems", "lat": 13.0480, "lng": 80.2090, "base_risk": 0.11},
    {"id": "S10", "name": "India Cements", "type": "supplier", "city": "Chennai", "sector": "Building Materials", "lat": 13.0700, "lng": 80.2500, "base_risk": 0.09},

    # === MANUFACTURERS ===
    {"id": "M01", "name": "Hyundai Motor India", "type": "manufacturer", "city": "Sriperumbudur", "sector": "Automobiles", "lat": 12.9716, "lng": 79.9437, "base_risk": 0.10},
    {"id": "M02", "name": "Ashok Leyland", "type": "manufacturer", "city": "Chennai", "sector": "Commercial Vehicles", "lat": 13.0350, "lng": 80.1750, "base_risk": 0.12},
    {"id": "M03", "name": "Royal Enfield (Eicher)", "type": "manufacturer", "city": "Tiruvottiyur", "sector": "Two Wheelers", "lat": 13.1600, "lng": 80.3000, "base_risk": 0.14},
    {"id": "M04", "name": "Titan Company", "type": "manufacturer", "city": "Hosur", "sector": "Watches & Jewelry", "lat": 12.7300, "lng": 77.8300, "base_risk": 0.08},
    {"id": "M05", "name": "Daimler India CV", "type": "manufacturer", "city": "Oragadam", "sector": "Trucks & Buses", "lat": 12.8200, "lng": 79.9900, "base_risk": 0.13},
    {"id": "M06", "name": "Saint-Gobain Glass", "type": "manufacturer", "city": "Sriperumbudur", "sector": "Glass Products", "lat": 12.9600, "lng": 79.9300, "base_risk": 0.09},
    {"id": "M07", "name": "Kone Elevator India", "type": "manufacturer", "city": "Chennai", "sector": "Elevators", "lat": 13.0400, "lng": 80.2100, "base_risk": 0.07},
    {"id": "M08", "name": "Eastman Exports", "type": "manufacturer", "city": "Tirupur", "sector": "Garments & Textiles", "lat": 11.1085, "lng": 77.3411, "base_risk": 0.16},
    {"id": "M09", "name": "Caterpillar India", "type": "manufacturer", "city": "Thiruvallur", "sector": "Heavy Equipment", "lat": 13.1430, "lng": 79.9080, "base_risk": 0.11},
    {"id": "M10", "name": "Renault Nissan Alliance", "type": "manufacturer", "city": "Oragadam", "sector": "Automobiles", "lat": 12.8100, "lng": 79.9800, "base_risk": 0.15},

    # === WAREHOUSES ===
    {"id": "W01", "name": "Chennai Port Trust Warehouse", "type": "warehouse", "city": "Chennai", "sector": "Port Logistics", "lat": 13.0878, "lng": 80.2942, "base_risk": 0.20},
    {"id": "W02", "name": "Madurai Central Depot", "type": "warehouse", "city": "Madurai", "sector": "Distribution", "lat": 9.9252, "lng": 78.1198, "base_risk": 0.12},
    {"id": "W03", "name": "Coimbatore Logistics Hub", "type": "warehouse", "city": "Coimbatore", "sector": "Regional Storage", "lat": 11.0300, "lng": 76.9700, "base_risk": 0.10},
    {"id": "W04", "name": "Trichy Distribution Center", "type": "warehouse", "city": "Tiruchirappalli", "sector": "Distribution", "lat": 10.7905, "lng": 78.7047, "base_risk": 0.11},
    {"id": "W05", "name": "Hosur Industrial Warehouse", "type": "warehouse", "city": "Hosur", "sector": "Industrial Storage", "lat": 12.7350, "lng": 77.8200, "base_risk": 0.13},
    {"id": "W06", "name": "Ennore Port Cold Storage", "type": "warehouse", "city": "Ennore", "sector": "Cold Chain", "lat": 13.2100, "lng": 80.3200, "base_risk": 0.17},
    {"id": "W07", "name": "Tirupur Textile Warehouse", "type": "warehouse", "city": "Tirupur", "sector": "Textile Storage", "lat": 11.1100, "lng": 77.3500, "base_risk": 0.14},
    {"id": "W08", "name": "Salem Steel Yard", "type": "warehouse", "city": "Salem", "sector": "Metal Storage", "lat": 11.6643, "lng": 78.1460, "base_risk": 0.10},
    {"id": "W09", "name": "Tuticorin Port Depot", "type": "warehouse", "city": "Tuticorin", "sector": "Export Hub", "lat": 8.7642, "lng": 78.1348, "base_risk": 0.19},
    {"id": "W10", "name": "Ambattur Industrial Warehouse", "type": "warehouse", "city": "Chennai", "sector": "Manufacturing Support", "lat": 13.1143, "lng": 80.1548, "base_risk": 0.11},
]

# Dependencies: (source_id, target_id, strength)
# strength = how critical this dependency is (0-1)
DEPENDENCIES = [
    # Suppliers -> Manufacturers
    ("S01", "M01", 0.9),   # Sundaram -> Hyundai
    ("S01", "M02", 0.7),   # Sundaram -> Ashok Leyland
    ("S02", "M04", 0.8),   # TVS Electronics -> Titan
    ("S02", "M07", 0.6),   # TVS Electronics -> Kone
    ("S03", "M08", 0.9),   # Lakshmi Machine -> Eastman Exports
    ("S04", "M03", 0.8),   # Roots Industries -> Royal Enfield
    ("S04", "M01", 0.5),   # Roots Industries -> Hyundai
    ("S05", "M06", 0.7),   # Carborundum -> Saint-Gobain
    ("S05", "M09", 0.6),   # Carborundum -> Caterpillar
    ("S06", "M02", 0.8),   # Super Auto Forge -> Ashok Leyland
    ("S06", "M05", 0.9),   # Super Auto Forge -> Daimler
    ("S07", "M09", 0.7),   # Shanthi Gears -> Caterpillar
    ("S07", "M05", 0.5),   # Shanthi Gears -> Daimler
    ("S08", "M08", 0.85),  # Precot Meridian -> Eastman Exports
    ("S09", "M01", 0.8),   # Rane -> Hyundai
    ("S09", "M10", 0.7),   # Rane -> Renault Nissan
    ("S09", "M03", 0.6),   # Rane -> Royal Enfield
    ("S10", "M06", 0.4),   # India Cements -> Saint-Gobain
    
    # Manufacturers -> Warehouses
    ("M01", "W01", 0.9),   # Hyundai -> Chennai Port
    ("M01", "W10", 0.6),   # Hyundai -> Ambattur
    ("M02", "W01", 0.8),   # Ashok Leyland -> Chennai Port
    ("M02", "W02", 0.7),   # Ashok Leyland -> Madurai
    ("M03", "W01", 0.7),   # Royal Enfield -> Chennai Port
    ("M03", "W06", 0.5),   # Royal Enfield -> Ennore Port
    ("M04", "W05", 0.8),   # Titan -> Hosur Warehouse
    ("M04", "W02", 0.6),   # Titan -> Madurai
    ("M05", "W01", 0.9),   # Daimler -> Chennai Port
    ("M05", "W04", 0.5),   # Daimler -> Trichy
    ("M06", "W10", 0.7),   # Saint-Gobain -> Ambattur
    ("M07", "W01", 0.6),   # Kone -> Chennai Port
    ("M08", "W07", 0.9),   # Eastman -> Tirupur Warehouse
    ("M08", "W09", 0.8),   # Eastman -> Tuticorin Port
    ("M09", "W08", 0.7),   # Caterpillar -> Salem Steel Yard
    ("M09", "W01", 0.5),   # Caterpillar -> Chennai Port
    ("M10", "W01", 0.8),   # Renault Nissan -> Chennai Port
    ("M10", "W10", 0.6),   # Renault Nissan -> Ambattur
    
    # Cross-dependencies (Warehouses -> Warehouses for distribution)
    ("W01", "W02", 0.5),   # Chennai Port -> Madurai
    ("W01", "W04", 0.4),   # Chennai Port -> Trichy
    ("W03", "W07", 0.6),   # Coimbatore Hub -> Tirupur Warehouse
    ("W01", "W09", 0.7),   # Chennai Port -> Tuticorin Port
]

# Disruption event templates for Tamil Nadu
DISRUPTION_TEMPLATES = [
    {"event": "Cyclone Michaung hits Chennai coast", "type": "natural_disaster", "severity": "critical", "affected_cities": ["Chennai", "Ennore", "Tiruvottiyur", "Sriperumbudur"], "impact_factor": 0.85},
    {"event": "Flooding in low-lying areas of Chennai", "type": "natural_disaster", "severity": "high", "affected_cities": ["Chennai", "Sriperumbudur", "Oragadam"], "impact_factor": 0.70},
    {"event": "Workers strike at Chennai Port", "type": "labor_dispute", "severity": "high", "affected_cities": ["Chennai"], "impact_factor": 0.60},
    {"event": "Power grid failure in Coimbatore district", "type": "infrastructure", "severity": "medium", "affected_cities": ["Coimbatore", "Tirupur"], "impact_factor": 0.50},
    {"event": "Major supplier shutdown in Hosur industrial area", "type": "supplier_failure", "severity": "high", "affected_cities": ["Hosur"], "impact_factor": 0.65},
    {"event": "Transportation blockade on NH44", "type": "logistics", "severity": "medium", "affected_cities": ["Hosur", "Salem", "Chennai"], "impact_factor": 0.45},
    {"event": "Raw material shortage in textile sector", "type": "supply_shortage", "severity": "high", "affected_cities": ["Coimbatore", "Tirupur"], "impact_factor": 0.55},
    {"event": "COVID outbreak at Oragadam manufacturing cluster", "type": "pandemic", "severity": "critical", "affected_cities": ["Oragadam", "Sriperumbudur"], "impact_factor": 0.75},
    {"event": "Earthquake tremors near Tiruchirappalli", "type": "natural_disaster", "severity": "medium", "affected_cities": ["Tiruchirappalli", "Salem"], "impact_factor": 0.40},
    {"event": "Cyber attack on port management systems", "type": "cyber", "severity": "critical", "affected_cities": ["Chennai", "Ennore", "Tuticorin"], "impact_factor": 0.80},
    {"event": "Drought affecting agricultural supply chain", "type": "natural_disaster", "severity": "medium", "affected_cities": ["Madurai", "Tiruchirappalli", "Salem"], "impact_factor": 0.35},
    {"event": "Chemical spill at SIPCOT industrial estate", "type": "environmental", "severity": "high", "affected_cities": ["Chennai", "Sriperumbudur"], "impact_factor": 0.55},
]

MOCK_NEWS = [
    {"id": 1, "title": "Cyclone warning issued for Tamil Nadu coast", "source": "The Hindu", "impact": "High", "time": "5m ago", "category": "Weather"},
    {"id": 2, "title": "Auto component exports from Chennai up 15%", "source": "Economic Times", "impact": "Low", "time": "15m ago", "category": "Industry"},
    {"id": 3, "title": "Coimbatore textile mills report power shortages", "source": "Dinamalar", "impact": "Medium", "time": "30m ago", "category": "Infrastructure"},
    {"id": 4, "title": "New expressway to boost Hosur-Chennai logistics", "source": "Times of India", "impact": "Low", "time": "1h ago", "category": "Logistics"},
    {"id": 5, "title": "Port congestion delays exports from Tuticorin", "source": "Shipping Gazette", "impact": "High", "time": "2h ago", "category": "Maritime"},
    {"id": 6, "title": "Steel prices surge affecting manufacturing costs", "source": "Business Standard", "impact": "Medium", "time": "3h ago", "category": "Commodities"},
    {"id": 7, "title": "Labor unrest at Sriperumbudur industrial belt", "source": "NDTV", "impact": "High", "time": "4h ago", "category": "Labor"},
    {"id": 8, "title": "TN government announces new industrial policy", "source": "Indian Express", "impact": "Low", "time": "5h ago", "category": "Policy"},
]
