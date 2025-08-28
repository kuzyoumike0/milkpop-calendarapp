-- milkpop-calendarapp/backend/init.sql

-- スキーマ固定（任意だが推奨）
SET search_path TO public;

-- users
CREATE TABLE IF NOT EXISTS users (
  id            BIGSERIAL PRIMARY KEY,
  discord_id    TEXT NOT NULL UNIQUE,
  username      TEXT NOT NULL,
  access_token  TEXT,
  refresh_token TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- updated_at を自動更新
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now(); RETURN NEW;
END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 共有スケジュール
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  dates JSONB NOT NULL,
  options JSONB,
  share_token VARCHAR(64) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 出欠
CREATE TABLE IF NOT EXISTS schedule_responses (
  id SERIAL PRIMARY KEY,
  schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE,
  user_id VARCHAR(64) NOT NULL,
  username TEXT,
  responses JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (schedule_id, user_id)
);

-- 個人スケジュール（共有リンク由来）
CREATE TABLE IF NOT EXISTS personal_schedules (
  id UUID PRIMARY KEY,
  share_id UUID REFERENCES schedules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  memo TEXT,
  dates JSONB NOT NULL,
  options JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ★ 個人予定（/api/personal-events 用）
CREATE TABLE IF NOT EXISTS personal_events (
  id UUID PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  memo  TEXT,
  date  DATE NOT NULL,
  time_type TEXT NOT NULL CHECK (time_type IN ('allday','day','night','custom')),
  start_time TIME,
  end_time   TIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (
    time_type <> 'custom'
    OR (start_time IS NOT NULL AND end_time IS NOT NULL AND start_time < end_time)
  )
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_schedule_responses_user
  ON schedule_responses (schedule_id, user_id);

CREATE INDEX IF NOT EXISTS idx_personal_events_user_date
  ON personal_events (user_id, date);


/*　旧init.sql

-- =========================
-- schedules（共有スケジュール）
-- =========================
CREATE TABLE IF NOT EXISTS schedules (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    dates JSONB NOT NULL,
    options JSONB,
    share_token VARCHAR(64) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- schedule_responses（出欠回答）
-- =========================
CREATE TABLE IF NOT EXISTS schedule_responses (
    id SERIAL PRIMARY KEY,
    schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL,
    username TEXT,
    responses JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(schedule_id, user_id)
);

-- =========================
-- personal_schedules（個人スケジュール）
-- =========================
CREATE TABLE IF NOT EXISTS personal_schedules (
    id UUID PRIMARY KEY,
    share_id UUID REFERENCES schedules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    memo TEXT,
    dates JSONB NOT NULL,
    options JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- users（Discordの個人識別情報）
-- =========================
CREATE TABLE IF NOT EXISTS public.users (
  id            BIGSERIAL PRIMARY KEY,
  discord_id    TEXT NOT NULL UNIQUE,
  username      TEXT NOT NULL,
  access_token  TEXT,
  refresh_token TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================
-- 出欠削除用インデックス（高速化）
-- =========================
CREATE INDEX IF NOT EXISTS idx_schedule_responses_user
ON schedule_responses(schedule_id, user_id);

*/
