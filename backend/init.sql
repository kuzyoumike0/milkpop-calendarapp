-- 個人スケジュール（共有なし）
CREATE TABLE IF NOT EXISTS personal_schedules (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  memo TEXT,
  date DATE NOT NULL,
  timeslot TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 共有スケジュール（共有リンク付き）
CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  linkid TEXT NOT NULL,
  date DATE NOT NULL,
  timeslot TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 共有ページの回答（○✕）
CREATE TABLE IF NOT EXISTS responses (
  id SERIAL PRIMARY KEY,
  linkid TEXT NOT NULL,
  username TEXT NOT NULL,
  answers JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
