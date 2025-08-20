CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  linkId TEXT NOT NULL,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  timeslot TEXT NOT NULL,          -- 全日 / 昼 / 夜 / 時間指定
  start_time TEXT,                 -- 時間指定開始
  end_time TEXT,                   -- 時間指定終了
  range_mode TEXT NOT NULL,        -- 範囲選択 / 複数選択
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS responses (
  id SERIAL PRIMARY KEY,
  scheduleId INTEGER REFERENCES schedules(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  response TEXT NOT NULL,          -- 〇 / ✖
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
