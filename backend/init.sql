DROP TABLE IF EXISTS schedules;

CREATE TABLE schedules (
  id SERIAL PRIMARY KEY,
  linkId TEXT NOT NULL,
  date DATE NOT NULL,
  username TEXT,
  category TEXT,
  startTime TEXT,
  endTime TEXT
);
