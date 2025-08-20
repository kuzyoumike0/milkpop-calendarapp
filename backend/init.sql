-- schedules: 共有用スケジュール
CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  memo TEXT,
  dates DATE[] NOT NULL,
  timeslot TEXT NOT NULL,
  linkid TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- responses: 回答
CREATE TABLE IF NOT EXISTS responses (
  id SERIAL PRIMARY KEY,
  linkid TEXT NOT NULL,
  username TEXT NOT NULL,
  answers JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
