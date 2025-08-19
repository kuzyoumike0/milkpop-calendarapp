-- 既存テーブルを削除（初期化用）
DROP TABLE IF EXISTS schedules;

-- スケジュール管理用テーブル
CREATE TABLE schedules (
  id SERIAL PRIMARY KEY,        -- 自動ID
  link_id TEXT NOT NULL,        -- 共有リンクID (UUID)
  username TEXT NOT NULL,       -- ユーザー名
  schedule_date DATE NOT NULL,  -- 日付
  mode TEXT NOT NULL            -- "multiple" or "range"
);

-- 検索効率を上げるためのインデックス
CREATE INDEX idx_schedules_link_id ON schedules(link_id);
CREATE INDEX idx_schedules_date ON schedules(schedule_date);
