-- === schedules テーブル ===
CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  memo TEXT,
  dates DATE[] NOT NULL,
  timeslot TEXT NOT NULL,
  range_mode TEXT NOT NULL,
  link_id TEXT UNIQUE
);

-- === responses テーブル ===
CREATE TABLE IF NOT EXISTS responses (
  id SERIAL PRIMARY KEY,
  schedule_id INTEGER REFERENCES schedules(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  answer TEXT NOT NULL,
  UNIQUE(schedule_id, username)
);
