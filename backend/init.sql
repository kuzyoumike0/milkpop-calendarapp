-- ========================
-- Users（Discordユーザー情報）
-- ========================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  discord_id VARCHAR(50) UNIQUE NOT NULL,
  username VARCHAR(100) NOT NULL,
  avatar VARCHAR(255),
  email VARCHAR(150),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- 個人日程（ユーザーごとの予定）
-- ========================
CREATE TABLE IF NOT EXISTS personal_schedules (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  memo TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_all_day BOOLEAN DEFAULT true,
  time_range VARCHAR(50), -- "昼" "夜" "終日" "カスタム"
  start_time TIME,        -- カスタム開始時刻
  end_time TIME,          -- カスタム終了時刻
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- 共有リンク（公開用URL）
-- ========================
CREATE TABLE IF NOT EXISTS personal_schedule_links (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  uuid VARCHAR(100) UNIQUE NOT NULL,  -- ランダム識別子
  title VARCHAR(255),                 -- 共有リンクのタイトル
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- 投票（参加 / 不参加）
-- ========================
CREATE TABLE IF NOT EXISTS schedule_votes (
  id SERIAL PRIMARY KEY,
  schedule_id INTEGER NOT NULL REFERENCES personal_schedules(id) ON DELETE CASCADE,
  voter_name VARCHAR(100) NOT NULL,       -- 投票者の名前（匿名 or Discordユーザー名）
  voter_discord_id VARCHAR(50),           -- Discordログイン時のID（未ログインはNULL）
  status VARCHAR(10) NOT NULL CHECK (status IN ('参加', '不参加')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- インデックス最適化
-- ========================
CREATE INDEX IF NOT EXISTS idx_personal_schedules_user_id 
  ON personal_schedules(user_id);

CREATE INDEX IF NOT EXISTS idx_schedule_links_uuid 
  ON personal_schedule_links(uuid);

CREATE UNIQUE INDEX IF NOT EXISTS idx_vote_unique 
  ON schedule_votes(schedule_id, COALESCE(voter_discord_id, voter_name));
