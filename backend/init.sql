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
-- users（Discord認証情報）
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


CREATE TABLE personal_schedules (
    id UUID PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    title TEXT NOT NULL,
    memo TEXT,
    dates JSONB NOT NULL,
    options JSONB,
    share_token VARCHAR(64) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 既存の外部キー制約を削除
ALTER TABLE personal_schedules DROP CONSTRAINT IF EXISTS fk_share;

-- share_id を NULL 許容に変更（必ず NOT NULL になっている場合）
ALTER TABLE personal_schedules ALTER COLUMN share_id DROP NOT NULL;
