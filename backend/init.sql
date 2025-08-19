CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  timeslot TEXT NOT NULL,
  range_mode TEXT NOT NULL,
  linkid TEXT
);

CREATE TABLE IF NOT EXISTS responses (
  id SERIAL PRIMARY KEY,
  schedule_id INTEGER REFERENCES schedules(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  response TEXT NOT NULL
);
