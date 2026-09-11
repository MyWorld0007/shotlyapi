-- ShotlyAPI D1 Database Schema (v4.1)
-- Run this in the Cloudflare D1 console.
-- NOTE: the DROP statements below WIPE existing data. To migrate an existing DB
-- incrementally, run only the missing CREATE TABLE / ALTER statements instead.

DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS page_views;
DROP TABLE IF EXISTS login_attempts;
DROP TABLE IF EXISTS usage;
DROP TABLE IF EXISTS users;

-- Users table.
-- Columns must match every column the worker writes in
--   INSERT INTO users (id, email, password_hash, salt, api_key,
--                      api_key_hash, api_key_display, plan, created_at)
CREATE TABLE users (
  id                TEXT PRIMARY KEY,
  email             TEXT UNIQUE NOT NULL,
  password_hash     TEXT NOT NULL,
  salt              TEXT NOT NULL,
  api_key           TEXT UNIQUE NOT NULL,
  api_key_hash      TEXT,
  api_key_display   TEXT,
  plan              TEXT DEFAULT 'none',
  trial_started_at  TEXT,
  plan_expires_at   TEXT,
  subscription_id   TEXT,
  is_suspended      INTEGER DEFAULT 0,
  reset_token       TEXT,
  reset_token_expires TEXT,
  created_at        TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_users_email   ON users(email);
CREATE INDEX idx_users_plan    ON users(plan);
CREATE INDEX idx_users_api_key ON users(api_key_hash);

-- Screenshot usage log. Uses the `timestamp` column (NOT created_at) — the
-- worker's admin overview filters on `usage.timestamp`.
CREATE TABLE usage (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  api_key   TEXT NOT NULL,
  url       TEXT NOT NULL,
  timestamp TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_usage_api_key   ON usage(api_key);
CREATE INDEX idx_usage_timestamp ON usage(timestamp);

-- Rate-limiting / audit log for auth endpoints.
CREATE TABLE login_attempts (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  ip        TEXT NOT NULL,
  endpoint  TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_login_attempts_ip        ON login_attempts(ip);
CREATE INDEX idx_login_attempts_created_at ON login_attempts(created_at);

-- Public page-view analytics (written by /api/admin/track).
CREATE TABLE page_views (
  id         TEXT PRIMARY KEY,
  page       TEXT NOT NULL,
  referrer   TEXT DEFAULT '',
  device     TEXT DEFAULT 'desktop',
  session_id TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_page_views_created_at ON page_views(created_at);
CREATE INDEX idx_page_views_session_id ON page_views(session_id);
CREATE INDEX idx_page_views_page       ON page_views(page);

-- User feedback submitted from the /feedback page.
-- The worker also runs CREATE TABLE IF NOT EXISTS for this table, so it
-- self-heals if it is missing from an existing database.
CREATE TABLE feedback (
  id         TEXT PRIMARY KEY,
  user_id    TEXT,
  email      TEXT DEFAULT '',
  rating     INTEGER NOT NULL,
  category   TEXT DEFAULT 'other',
  message    TEXT NOT NULL,
  ip         TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_feedback_created_at ON feedback(created_at);
CREATE INDEX idx_feedback_user_id    ON feedback(user_id);

-- Payments. status is one of: 'created', 'captured', 'failed'.
CREATE TABLE payments (
  id                TEXT PRIMARY KEY,
  user_id           TEXT,
  razorpay_order_id      TEXT,
  razorpay_payment_id    TEXT,
  razorpay_subscription_id TEXT,
  amount       INTEGER NOT NULL DEFAULT 0,
  plan         TEXT,
  status       TEXT NOT NULL DEFAULT 'created',
  created_at   TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_payments_status     ON payments(status);
CREATE INDEX idx_payments_user_id    ON payments(user_id);
CREATE INDEX idx_payments_created_at  ON payments(created_at);

-- ---------------------------------------------------------------------------
-- Seed an admin user so you can log into /admin/login.
-- IMPORTANT: replace the password_hash/salt below with a real PBKDF2 hash of
-- your password (the worker uses hashPasswordPBKDF2). The placeholder values
-- here will NOT let you log in — generate them via your worker's helper or a
-- one-off script. Then set plan = 'admin'.
-- ---------------------------------------------------------------------------
-- INSERT INTO users (id, email, password_hash, salt, api_key, api_key_hash,
--                    api_key_display, plan, created_at)
-- VALUES ('admin-0001', 'admin@shotlyapi.in', '<REAL_HASH>', '<REAL_SALT>',
--         'sk_admin_seed', '<REAL_APIKEY_HASH>', 'sk_adm••••seed', 'admin',
--         datetime('now'));
