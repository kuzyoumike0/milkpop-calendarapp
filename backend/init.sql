-- 古いテーブルを削除
DROP TABLE IF EXISTS schedule;
DROP TABLE IF EXISTS schedules;

-- 新しい schedules テーブル
CREATE TABLE schedules (
  id SERIAL PRIMARY KEY,
  link_id TEXT NOT NULL,         -- 共有リンクID
  username TEXT NOT NULL,
  schedule_date DATE NOT NULL,
  mode TEXT NOT NULL
);
