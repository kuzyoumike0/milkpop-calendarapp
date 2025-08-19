CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  link_id VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL,
  schedule_date DATE NOT NULL,
  mode VARCHAR(50), -- 朝/昼/夜/全日 などのラベル
  time_slot INT,    -- 1〜24時の時間指定（NULLも可）
  created_at TIMESTAMP DEFAULT NOW()
);
