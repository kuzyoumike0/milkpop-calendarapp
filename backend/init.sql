-- ============================
-- Schedules テーブル作成
-- ============================
CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  link_id VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL,
  schedule_date DATE NOT NULL,
  mode VARCHAR(50) NOT NULL
);

-- ============================
-- カラム追加（存在しなければ追加）
-- ============================
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS time_slot VARCHAR(50);

-- ============================
-- カラム型変更（存在すれば変更）
-- ============================
DO $$
BEGIN
  -- mode を VARCHAR(100) に変更
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='schedules' AND column_name='mode'
  ) THEN
    ALTER TABLE schedules ALTER COLUMN mode TYPE VARCHAR(100);
  END IF;
END$$;

-- ============================
-- カラム削除（存在すれば削除）
-- ============================
ALTER TABLE schedules DROP COLUMN IF EXISTS old_column;
