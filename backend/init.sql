DROP TABLE IF EXISTS schedules;

CREATE TABLE schedules (
  id SERIAL PRIMARY KEY,
  linkId TEXT NOT NULL,
  username TEXT NOT NULL,
  date DATE NOT NULL,
  category TEXT NOT NULL,     -- 区分（終日 / 昼 / 夜 / 時間帯）
  startTime TEXT,             -- "時間帯" の場合のみ有効
  endTime TEXT                -- "時間帯" の場合のみ有効
);
