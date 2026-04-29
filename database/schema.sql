-- ChainQuake PostgreSQL Schema

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE companies (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    city VARCHAR(100),
    sector VARCHAR(100),
    lat FLOAT,
    lng FLOAT,
    base_risk FLOAT DEFAULT 0.1,
    current_risk FLOAT DEFAULT 0.1,
    status VARCHAR(50) DEFAULT 'operational',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dependencies (
    id SERIAL PRIMARY KEY,
    source_id VARCHAR(10) REFERENCES companies(id),
    target_id VARCHAR(10) REFERENCES companies(id),
    strength FLOAT DEFAULT 0.5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    severity VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    company_id VARCHAR(10),
    acknowledged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE risk_data (
    id SERIAL PRIMARY KEY,
    company_id VARCHAR(10) REFERENCES companies(id),
    risk_score FLOAT,
    event_type VARCHAR(100),
    prediction JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
