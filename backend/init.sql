-- ユーザー個人スケジュール
CREATE TABLE IF NOT EXISTS personal_schedules (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,   -- 'all', 'day', 'night' など
  title TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 共有イベント
CREATE TABLE IF NOT EXISTS shared_events (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 共有リンク管理
CREATE TABLE IF NOT EXISTS share_links (
  id SERIAL PRIMARY KEY,
  share_id UUID NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
