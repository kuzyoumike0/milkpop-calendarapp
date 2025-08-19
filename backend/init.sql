DROP TABLE IF EXISTS schedule;
DROP TABLE IF EXISTS schedules;

CREATE TABLE schedules (
  id SERIAL PRIMARY KEY,
  link_id TEXT NOT NULL,
  username TEXT NOT NULL,
  schedule_date DATE NOT NULL,
  mode TEXT NOT NULL
);
