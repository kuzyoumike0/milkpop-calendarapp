-- スケジュールテーブル
CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  linkId TEXT NOT NULL,
  username TEXT NOT NULL,
  date TEXT NOT NULL,
  timeslot TEXT NOT NULL
);

-- リンクテーブル
CREATE TABLE IF NOT EXISTS links (
  linkId TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
