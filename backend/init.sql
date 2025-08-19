CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  timeslot TEXT NOT NULL,
  range_mode TEXT NOT NULL,
  linkid TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS votes (
  id SERIAL PRIMARY KEY,
  linkid TEXT NOT NULL,
  username TEXT NOT NULL,
  votes JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
