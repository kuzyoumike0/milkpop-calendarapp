-- ===============================
-- Schedules テーブル
-- ===============================
CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    date DATE NOT NULL,
    timeslot TEXT NOT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    linkId TEXT
);

-- ===============================
-- 共有リンクテーブル
-- ===============================
CREATE TABLE IF NOT EXISTS share_links (
    linkId TEXT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
