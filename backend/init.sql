DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS shares CASCADE;

CREATE TABLE schedules (
  id SERIAL PRIMARY KEY,
  linkid TEXT NOT NULL,
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  timeslot TEXT NOT NULL,
  range_mode TEXT NOT NULL CHECK (range_mode IN ('range', 'multiple')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE shares (
  id SERIAL PRIMARY KEY,
  linkid TEXT NOT NULL,
  username TEXT NOT NULL,
  responses JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
