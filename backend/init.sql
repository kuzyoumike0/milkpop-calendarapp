-- スケジュール本体
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY,        -- uuidに変更
  title TEXT NOT NULL,
  linkId UUID NOT NULL
);

-- スケジュール項目
CREATE TABLE IF NOT EXISTS schedule_items (
  id UUID PRIMARY KEY,
  scheduleId UUID REFERENCES schedules(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  timeslot TEXT NOT NULL,
  starttime INT,
  endtime INT
);

-- 参加者回答
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY,
  scheduleId UUID REFERENCES schedules(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  date DATE NOT NULL,
  timeslot TEXT NOT NULL,
  status TEXT NOT NULL
);
