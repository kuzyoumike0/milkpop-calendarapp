-- 既存テーブル削除（なければ無視）
DROP TABLE IF EXISTS schedules;

-- schedules テーブル作成
CREATE TABLE schedules (
  id SERIAL PRIMARY KEY,
  link_id TEXT NOT NULL,
  username TEXT NOT NULL,
  schedule_date DATE NOT NULL,
  mode TEXT NOT NULL
);

-- インデックス作成（検索高速化用）
CREATE INDEX idx_schedules_link_id ON schedules(link_id);
CREATE INDEX idx_schedules_date ON schedules(schedule_date);
