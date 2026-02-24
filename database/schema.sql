-- PostgreSQL Schema for Senior Benefits Application

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  age INTEGER NOT NULL,
  province VARCHAR(2) NOT NULL,
  postal_code VARCHAR(6),
  residency_status VARCHAR(50) NOT NULL,
  income_range VARCHAR(20) NOT NULL,
  medical_conditions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Benefits table
CREATE TABLE IF NOT EXISTS benefits (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  provider VARCHAR(255) NOT NULL,
  application_url VARCHAR(500),
  phone_number VARCHAR(20),
  minimum_age INTEGER,
  maximum_age INTEGER,
  residency_requirement VARCHAR(255),
  income_limit_low DECIMAL,
  income_limit_high DECIMAL,
  provinces TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Benefit Eligibility Rules table
CREATE TABLE IF NOT EXISTS benefit_eligibility_rules (
  id UUID PRIMARY KEY,
  benefit_id UUID NOT NULL REFERENCES benefits(id) ON DELETE CASCADE,
  condition VARCHAR(100) NOT NULL,
  operator VARCHAR(20) NOT NULL,
  value VARCHAR(255) NOT NULL,
  weight INTEGER DEFAULT 10
);

-- User Benefit History table
CREATE TABLE IF NOT EXISTS user_benefit_history (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  benefit_id UUID NOT NULL REFERENCES benefits(id) ON DELETE CASCADE,
  match_score INTEGER,
  recommendation_source VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_benefits_provider ON benefits(provider);
CREATE INDEX IF NOT EXISTS idx_benefit_rules_benefit_id ON benefit_eligibility_rules(benefit_id);
CREATE INDEX IF NOT EXISTS idx_user_history_user_id ON user_benefit_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_history_benefit_id ON user_benefit_history(benefit_id);
