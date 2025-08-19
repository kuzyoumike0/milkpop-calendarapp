CREATE TABLE IF NOT EXISTS share_links (
  linkId TEXT PRIMARY KEY,
  createdAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS schedules (
  id TEXT PRIMARY KEY,
  linkId TEXT REFERENCES share_links(linkId) ON DELETE CASCADE,
  username TEXT NOT NULL,
  date DATE NOT NULL,
  timeslot TEXT NOT NULL,
  comment TEXT,
  token TEXT NOT NULL
);
