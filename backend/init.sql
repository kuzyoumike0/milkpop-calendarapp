-- 古いテーブル（間違っているもの）を削除
DROP TABLE IF EXISTS schedule;
DROP TABLE IF EXISTS schedules;

-- 新しいテーブルを作成
CREATE TABLE schedules (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  schedule_date DATE NOT NULL,
  mode TEXT NOT NULL
);
