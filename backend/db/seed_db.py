from backend.core.database import SessionLocal, Node, Edge, init_db
from backend.core.seed_data import COMPANIES, DEPENDENCIES

def seed_database():
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(Node).first():
            print("DATABASE: Already seeded. Skipping.")
            return

        print("DATABASE: Seeding mission-critical entities...")
        # Add Nodes
        for c in COMPANIES:
            node = Node(
                id=c["id"], name=c["name"], type=c["type"],
                city=c["city"], lat=c["lat"], lng=c["lng"],
                base_risk=c["base_risk"], current_risk=c["base_risk"],
                status="operational",
                metadata_json={"sector": c["sector"]}
            )
            db.add(node)
        
        # Add Edges
        for source, target, strength in DEPENDENCIES:
            edge = Edge(source=source, target=target, latency=strength * 20)
            db.add(edge)
            
        db.commit()
        print("DATABASE: Seeding complete. 30+ nodes and 40+ dependencies synchronized.")
    except Exception as e:
        print(f"DATABASE: Seeding Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
    seed_database()
