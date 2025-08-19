-- init.sql
-- 既存テーブルを削除しないで、必要なときだけ追加

-- schedules テーブルが存在しなければ作成
CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  link_id VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL,
  schedule_date DATE NOT NULL,
  mode VARCHAR(50) NOT NULL
);

-- 既存テーブルにカラムがなければ追加（Postgres 15以降）
DO $$
BEGIN
  -- link_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='schedules' AND column_name='link_id'
  ) THEN
    ALTER TABLE schedules ADD COLUMN link_id VARCHAR(255) NOT NULL;
  END IF;

  -- username
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='schedules' AND column_name='username'
  ) THEN
    ALTER TABLE schedules ADD COLUMN username VARCHAR(255) NOT NULL;
  END IF;

  -- schedule_date
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='schedules' AND column_name='schedule_date'
  ) THEN
    ALTER TABLE schedules ADD COLUMN schedule_date DATE NOT NULL;
  END IF;

  -- mode
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='schedules' AND column_name='mode'
  ) THEN
    ALTER TABLE schedules ADD COLUMN mode VARCHAR(50) NOT NULL;
  END IF;
END$$;

-- インデックスを保証
CREATE INDEX IF NOT EXISTS idx_schedules_link_id ON schedules(link_id);
CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(schedule_date);
