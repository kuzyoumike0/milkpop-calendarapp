-- 古いテーブルを削除（単数形・間違いを消す）
DROP TABLE IF EXISTS schedule;
DROP TABLE IF EXISTS schedules;

-- 正しいテーブルを作成
CREATE TABLE schedules (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  schedule_date DATE NOT NULL,
  mode TEXT NOT NULL
);
