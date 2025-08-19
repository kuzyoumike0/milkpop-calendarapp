-- 既存テーブルを削除（依存関係を考慮して responses → schedules → links の順）
DROP TABLE IF EXISTS responses;
DROP TABLE IF EXISTS schedules;
DROP TABLE IF EXISTS links;

-- リンク（イベント）テーブル
CREATE TABLE links (
  id TEXT PRIMARY KEY,
  title TEXT
);

-- スケジュール（候補日程）テーブル
CREATE TABLE schedules (
  id SERIAL PRIMARY KEY,
  link_id TEXT REFERENCES links(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  timeslot TEXT NOT NULL
);

-- 回答（ユーザーごとの可否）テーブル
CREATE TABLE responses (
  id SERIAL PRIMARY KEY,
  link_id TEXT REFERENCES links(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  timeslot TEXT NOT NULL,
  username TEXT NOT NULL,
  choice TEXT NOT NULL  -- '◯' または '×'
);
