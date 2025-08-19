-- 既存のテーブルを削除（初期化用）
DROP TABLE IF EXISTS responses;
DROP TABLE IF EXISTS schedules;

-- スケジュールテーブル
CREATE TABLE schedules (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  timeslot TEXT NOT NULL,
  range_mode TEXT NOT NULL,
  linkid TEXT
);

-- 参加者レスポンステーブル
CREATE TABLE responses (
  id SERIAL PRIMARY KEY,
  schedule_id INTEGER REFERENCES schedules(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  response TEXT NOT NULL
);
