DROP TABLE IF EXISTS responses;
DROP TABLE IF EXISTS schedules;
DROP TABLE IF EXISTS links;

CREATE TABLE links (
  id TEXT PRIMARY KEY,
  title TEXT
);

CREATE TABLE schedules (
  id SERIAL PRIMARY KEY,
  link_id TEXT REFERENCES links(id) ON DELETE CASCADE,
  date TEXT,
  timeslot TEXT
);

CREATE TABLE responses (
  id SERIAL PRIMARY KEY,
  link_id TEXT REFERENCES links(id) ON DELETE CASCADE,
  date TEXT,
  timeslot TEXT,
  username TEXT,
  choice TEXT
);
