-- =============================
-- schedules テーブル
-- =============================
CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    link_id TEXT,
    title TEXT,
    date DATE NOT NULL,
    timeslot TEXT NOT NULL,
    start_time TEXT,
    end_time TEXT,
    memo TEXT
);

-- =============================
-- responses テーブル
-- =============================
CREATE TABLE IF NOT EXISTS responses (
    id SERIAL PRIMARY KEY,
    schedule_id INT REFERENCES schedules(id) ON DELETE CASCADE,
    username TEXT,
    response TEXT
);
