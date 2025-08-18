CREATE TABLE IF NOT EXISTS shared_links (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shared_schedules (
  id SERIAL PRIMARY KEY,
  link_id TEXT NOT NULL REFERENCES shared_links(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  username TEXT NOT NULL,
  time_info TEXT NOT NULL
);
