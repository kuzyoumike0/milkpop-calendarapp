-- 古いテーブルを削除して作り直す方法（データが消えてもOKならこちら）
DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS personal_schedules CASCADE;

CREATE TABLE schedules (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  dates TEXT[] NOT NULL,      -- ✅ 正しいカラム
  range_mode TEXT NOT NULL,
  timeslot TEXT NOT NULL,
  linkid TEXT UNIQUE
);

CREATE TABLE personal_schedules (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  memo TEXT,
  dates TEXT[] NOT NULL,      -- ✅ 正しいカラム
  range_mode TEXT NOT NULL,
  timeslot TEXT NOT NULL
);
