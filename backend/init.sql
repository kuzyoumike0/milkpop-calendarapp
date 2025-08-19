-- schedules テーブルを作成（存在しなければ）
CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  link_id TEXT NOT NULL,
  username TEXT NOT NULL,
  schedule_date DATE NOT NULL,
  mode TEXT NOT NULL
);

-- インデックス（検索高速化）
CREATE INDEX IF NOT EXISTS idx_schedules_link_id ON schedules (link_id);
