-- 既存テーブルを削除（依存関係も含めて完全削除）
DROP TABLE IF EXISTS participants CASCADE;
DROP TABLE IF EXISTS schedule_items CASCADE;
DROP TABLE IF EXISTS schedules CASCADE;

-- スケジュール本体（共有リンク単位）
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  linkId UUID NOT NULL UNIQUE
);

-- スケジュールに属する日付・時間帯の候補
CREATE TABLE IF NOT EXISTS schedule_items (
  id UUID PRIMARY KEY,
  scheduleId UUID REFERENCES schedules(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  timeslot TEXT NOT NULL,  -- 全日 / 昼 / 夜 / custom
  starttime INT,
  endtime INT
);

-- 参加者の回答
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY,
  scheduleId UUID REFERENCES schedules(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  date DATE NOT NULL,
  timeslot TEXT NOT NULL,
  status TEXT NOT NULL      -- ◯ / × など
);
