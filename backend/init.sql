-- === schedules: 共有スケジュール ===
CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  timeslot TEXT NOT NULL,
  range_mode TEXT NOT NULL,
  linkid UUID NOT NULL
);

-- === personal_schedules: 個人スケジュール ===
CREATE TABLE IF NOT EXISTS personal_schedules (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  timeslot TEXT NOT NULL,
  range_mode TEXT NOT NULL
);

-- === responses: 共有スケジュールへの応答（◯✕） ===
CREATE TABLE IF NOT EXISTS responses (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  schedule_id INT NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  response TEXT NOT NULL
);
