DROP TABLE IF EXISTS schedules;

CREATE TABLE schedules (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  username TEXT,
  category TEXT,
  starttime TEXT,
  endtime TEXT,
  linkid TEXT
);
