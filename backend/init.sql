CREATE TABLE IF NOT EXISTS shared_schedules (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  username TEXT NOT NULL  -- 作成者
);
