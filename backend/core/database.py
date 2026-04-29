from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from backend.core.config import settings

# Database Configuration
engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
class Node(Base):
    __tablename__ = "nodes"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    type = Column(String) # Factory, Hub, Supplier
    city = Column(String)
    lat = Column(Float)
    lng = Column(Float)
    base_risk = Column(Float, default=0.1)
    current_risk = Column(Float, default=0.1)
    status = Column(String, default="operational")
    metadata_json = Column(JSON, default={})

class Edge(Base):
    __tablename__ = "edges"
    id = Column(Integer, primary_key=True, index=True)
    source = Column(String, ForeignKey("nodes.id"))
    target = Column(String, ForeignKey("nodes.id"))
    type = Column(String, default="primary")
    latency = Column(Float, default=10.0)

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String)
    severity = Column(String) # High, Medium, Low
    message = Column(String)
    node_id = Column(String, ForeignKey("nodes.id"), nullable=True)
    timestamp = Column(String)
    resolved = Column(Integer, default=0)

# DB Initialization
def init_db():
    Base.metadata.create_all(bind=engine)
    print("DATABASE: Schema initialized successfully.")

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
