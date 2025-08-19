-- schedules テーブル（個人スケジュール）
CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    date DATE NOT NULL,
    timeslot TEXT NOT NULL,
    linkId TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (username, date, timeslot, linkId) -- 同じ日×時間帯×ユーザーは1件に制限
);

-- shared_links テーブル（共有リンク）
CREATE TABLE IF NOT EXISTS shared_links (
    id SERIAL PRIMARY KEY,
    linkId TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
