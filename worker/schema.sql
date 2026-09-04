-- ShotlyAPI D1 Database Schema
-- Run this in Cloudflare D1 Console

DROP TABLE IF EXISTS usage;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  api_key TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'free',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  api_key TEXT NOT NULL,
  url TEXT NOT NULL,
  timestamp TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_usage_api_key ON usage(api_key);
CREATE INDEX idx_usage_timestamp ON usage(timestamp);

-- Insert test user (remove in production)
INSERT INTO users (id, email, password_hash, salt, api_key, plan) 
VALUES ('test-user-001', 'test@test.com', 'test-hash', 'test-salt', 'test-key-123', 'free');
