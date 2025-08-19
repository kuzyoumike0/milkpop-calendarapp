-- init.sql

-- 既存テーブルを削除（初回のみ全消ししたい場合）
DROP TABLE IF EXISTS schedules;

-- schedules テーブルを作成
CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,              -- 通し番号
  link_id VARCHAR(255) NOT NULL,      -- 共有リンクID (UUID)
  username VARCHAR(255) NOT NULL,     -- ユーザー名
  schedule_date DATE NOT NULL,        -- 日付 (例: 2025-08-19)
  mode VARCHAR(50) NOT NULL           -- 時間帯 (朝 / 昼 / 夜 / 全日 / 時間指定)
);

-- インデックス（検索高速化用）
CREATE INDEX IF NOT EXISTS idx_schedules_link_id ON schedules(link_id);
CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(schedule_date);
