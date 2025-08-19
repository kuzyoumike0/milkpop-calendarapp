-- schedules テーブル作成
CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  schedule_date DATE NOT NULL,
  mode TEXT NOT NULL
);
