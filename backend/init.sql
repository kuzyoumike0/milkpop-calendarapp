-- 既存テーブルを保持しつつ、無ければ作成
CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  link_id VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL,
  schedule_date DATE NOT NULL,
  mode VARCHAR(50) NOT NULL,
  time_slot INT
);

-- 新しいカラムが無ければ追加
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='schedules' AND column_name='time_slot'
  ) THEN
    ALTER TABLE schedules ADD COLUMN time_slot INT;
  END IF;
END $$;
