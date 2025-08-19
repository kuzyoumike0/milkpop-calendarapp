CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  linkId TEXT NOT NULL,
  username TEXT NOT NULL,
  date TEXT NOT NULL,
  timeslot TEXT NOT NULL,
  UNIQUE(linkId, username, date, timeslot)
);

CREATE TABLE IF NOT EXISTS links (
  linkId TEXT PRIMARY KEY,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
