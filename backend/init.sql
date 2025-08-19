-- 古いテーブルが存在する場合は削除
DROP TABLE IF EXISTS schedule;

-- 新しい schedules テーブルを作成
CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  schedule_date DATE NOT NULL,
  mode TEXT NOT NULL
);
