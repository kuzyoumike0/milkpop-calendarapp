-- schedules テーブル
CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    dates TEXT[] NOT NULL,
    linkid TEXT UNIQUE NOT NULL,
    start_time TEXT,
    end_time TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- responses テーブル
CREATE TABLE IF NOT EXISTS responses (
    id SERIAL PRIMARY KEY,
    linkid TEXT NOT NULL REFERENCES schedules(linkid) ON DELETE CASCADE,
    username TEXT NOT NULL,
    answers JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
