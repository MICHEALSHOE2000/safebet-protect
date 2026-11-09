-- Run once in the Supabase SQL Editor. App tables are private, server-only.
BEGIN;
CREATE SCHEMA IF NOT EXISTS safebet;
REVOKE ALL ON SCHEMA safebet FROM PUBLIC, anon, authenticated;
CREATE TABLE IF NOT EXISTS safebet.live_records (
 id text PRIMARY KEY, kind text NOT NULL, owner text NOT NULL,
 state text NOT NULL, data text NOT NULL, version integer NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS live_records_kind_owner ON safebet.live_records(kind, owner);
CREATE INDEX IF NOT EXISTS live_records_kind_state ON safebet.live_records(kind, state);
CREATE TABLE IF NOT EXISTS safebet.identity_index (
 fingerprint text PRIMARY KEY, customer_id text NOT NULL, kind text NOT NULL
);
CREATE TABLE IF NOT EXISTS safebet.live_exclusions (
 customer_id text PRIMARY KEY, start bigint NOT NULL, "end" bigint NOT NULL,
 version integer NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS safebet.live_audit (
 id text PRIMARY KEY, actor text NOT NULL, action text NOT NULL,
 at bigint NOT NULL, target text NOT NULL, digest text NOT NULL
);
CREATE INDEX IF NOT EXISTS live_audit_at ON safebet.live_audit(at DESC);
CREATE TABLE IF NOT EXISTS safebet.rate_limits (
 id text PRIMARY KEY, count integer NOT NULL, expires bigint NOT NULL
);
CREATE INDEX IF NOT EXISTS rate_limits_expires ON safebet.rate_limits(expires);
REVOKE ALL ON ALL TABLES IN SCHEMA safebet FROM PUBLIC, anon, authenticated;
ALTER TABLE safebet.live_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE safebet.identity_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE safebet.live_exclusions ENABLE ROW LEVEL SECURITY;
ALTER TABLE safebet.live_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE safebet.rate_limits ENABLE ROW LEVEL SECURITY;
-- No public bucket or client policies. Downloads go through the authorised API.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('safebet-evidence', 'safebet-evidence', false, 4194304, ARRAY['application/octet-stream'])
ON CONFLICT (id) DO UPDATE SET public=false;
COMMIT;
