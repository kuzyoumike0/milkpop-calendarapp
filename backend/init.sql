CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  memo TEXT,
  dates DATE[] NOT NULL,
  timeslot TEXT NOT NULL,
  range_mode TEXT NOT NULL,
  linkid TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS responses (
  id SERIAL PRIMARY KEY,
  linkid TEXT NOT NULL,
  username TEXT NOT NULL,
  answers JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
