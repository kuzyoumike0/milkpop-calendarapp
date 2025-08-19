-- 既存テーブル削除（依存関係も消す）
DROP TABLE IF EXISTS responses CASCADE;
DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS share_links CASCADE;

-- 共有リンク管理
CREATE TABLE share_links (
  id SERIAL PRIMARY KEY,
  linkid TEXT UNIQUE NOT NULL,   -- UUID形式のリンクID
  title TEXT NOT NULL            -- 共有リンクのタイトル
);

-- スケジュール情報
CREATE TABLE schedules (
  id SERIAL PRIMARY KEY,
  linkid TEXT NOT NULL REFERENCES share_links(linkid) ON DELETE CASCADE, -- 共有リンクに紐づく
  date DATE NOT NULL,          -- 日付
  timeslot TEXT NOT NULL,      -- 全日 / 昼 / 夜 / custom
  starttime TEXT,              -- custom用開始時間
  endtime TEXT                 -- custom用終了時間
);

-- 出欠回答
CREATE TABLE responses (
  id SERIAL PRIMARY KEY,
  schedule_id INT NOT NULL REFERENCES schedules(id) ON DELETE CASCADE, -- スケジュールに紐づく
  username TEXT NOT NULL,       -- ユーザー名
  response TEXT NOT NULL        -- ○ or ✖
);
