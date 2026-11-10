BEGIN;
CREATE TABLE IF NOT EXISTS safebet.deployment_guard (
 singleton boolean PRIMARY KEY DEFAULT true CHECK(singleton),
 mode text NOT NULL CHECK(mode IN ('demo','production'))
);
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM safebet.identity_index WHERE kind='demo') AND EXISTS(SELECT 1 FROM safebet.identity_index WHERE kind<>'demo') THEN
  RAISE EXCEPTION 'Mixed identity environments require manual review before migration';
 END IF;
END $$;
INSERT INTO safebet.deployment_guard(singleton,mode)
SELECT true, CASE WHEN EXISTS(SELECT 1 FROM safebet.identity_index WHERE kind='demo') THEN 'demo' ELSE 'production' END
ON CONFLICT DO NOTHING;
CREATE OR REPLACE FUNCTION safebet.enforce_identity_environment() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE configured text;
BEGIN
 SELECT mode INTO configured FROM safebet.deployment_guard WHERE singleton=true;
 IF configured IS NULL OR (NEW.kind='demo')<>(configured='demo') THEN RAISE EXCEPTION 'Identity environment mismatch' USING ERRCODE='23514'; END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS identity_environment ON safebet.identity_index;
CREATE TRIGGER identity_environment BEFORE INSERT OR UPDATE ON safebet.identity_index FOR EACH ROW EXECUTE FUNCTION safebet.enforce_identity_environment();
CREATE OR REPLACE FUNCTION safebet.lock_identity_environment() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP='DELETE' OR (NEW.mode<>OLD.mode AND EXISTS(SELECT 1 FROM safebet.identity_index)) THEN RAISE EXCEPTION 'Cannot change an environment containing identities'; END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS environment_lock ON safebet.deployment_guard;
CREATE TRIGGER environment_lock BEFORE UPDATE OR DELETE ON safebet.deployment_guard FOR EACH ROW EXECUTE FUNCTION safebet.lock_identity_environment();
REVOKE ALL ON safebet.deployment_guard FROM PUBLIC,anon,authenticated;
ALTER TABLE safebet.deployment_guard ENABLE ROW LEVEL SECURITY;
COMMIT;
