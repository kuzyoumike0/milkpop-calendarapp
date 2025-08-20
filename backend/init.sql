-- スケジュールテーブル
CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  memo TEXT,                -- 個人スケジュール用のメモ欄
  date DATE NOT NULL,
  timeslot TEXT NOT NULL,   -- 終日 / 昼 / 夜 / 時間指定
  range_mode TEXT NOT NULL, -- 複数日 or 範囲選択
  linkid TEXT,              -- 共有リンクID
  link_title TEXT           -- 共有リンクタイトル
);

-- 回答テーブル
CREATE TABLE IF NOT EXISTS responses (
  id SERIAL PRIMARY KEY,
  schedule_id INT REFERENCES schedules(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  response TEXT NOT NULL,
  UNIQUE(schedule_id, username)
);
