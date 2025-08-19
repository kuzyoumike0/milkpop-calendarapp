DROP TABLE IF EXISTS schedules;

CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  start_time TEXT,
  end_time TEXT,
  linkId TEXT NOT NULL
);
