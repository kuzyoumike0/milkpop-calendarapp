
-- 001_alter_shared_events_slots.sql

CREATE TABLE IF NOT EXISTS shared_events (
  id SERIAL PRIMARY KEY,
  share_id TEXT NOT NULL,
  event_date DATE NOT NULL,
  title TEXT NOT NULL,
  slots TEXT[] NOT NULL DEFAULT ARRAY['全日'],
  memo TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- not blank title
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_shared_events_title_not_blank'
  ) THEN
    ALTER TABLE shared_events
      ADD CONSTRAINT chk_shared_events_title_not_blank
      CHECK (length(btrim(title)) > 0);
  END IF;
END$$;

-- whitelist for slots
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_shared_events_slots_whitelist'
  ) THEN
    ALTER TABLE shared_events
      ADD CONSTRAINT chk_shared_events_slots_whitelist
      CHECK (
        slots <@ ARRAY['全日','朝','昼','夜','中締め']::text[]
        AND cardinality(slots) >= 1
      );
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_shared_events_share_date
  ON shared_events (share_id, event_date);
