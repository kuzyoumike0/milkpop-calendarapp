DROP TABLE IF EXISTS responses CASCADE;
DROP TABLE IF EXISTS schedules CASCADE;

CREATE TABLE schedules (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  timeslot TEXT NOT NULL,
  range_mode TEXT NOT NULL,
  linkid UUID NOT NULL
);

CREATE TABLE responses (
  id SERIAL PRIMARY KEY,
  linkid UUID NOT NULL,
  username TEXT NOT NULL,
  schedule_id INT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
