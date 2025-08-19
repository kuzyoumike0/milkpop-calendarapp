-- init.sql
DROP TABLE IF EXISTS responses CASCADE;
DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS share_links CASCADE;

CREATE TABLE share_links (
  id SERIAL PRIMARY KEY,
  linkid TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL
);

CREATE TABLE schedules (
  id SERIAL PRIMARY KEY,
  linkid TEXT NOT NULL REFERENCES share_links(linkid) ON DELETE CASCADE,
  date DATE NOT NULL,
  timeslot TEXT NOT NULL,
  starttime TEXT,
  endtime TEXT
);

CREATE TABLE responses (
  id SERIAL PRIMARY KEY,
  schedule_id INT NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  response TEXT NOT NULL -- ○ or ✖
);
