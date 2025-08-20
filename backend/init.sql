-- === schedules: 共有用スケジュール ===
CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    linkid TEXT NOT NULL,
    title TEXT NOT NULL,
    range_mode TEXT NOT NULL,         -- "range" or "multiple"
    dates DATE[] NOT NULL,
    start_time TEXT NOT NULL,         -- "HH:MM"
    end_time TEXT NOT NULL,           -- "HH:MM"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- === personal_schedules: 個人用スケジュール ===
CREATE TABLE IF NOT EXISTS personal_schedules (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    memo TEXT,
    range_mode TEXT NOT NULL,
    dates DATE[] NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- === responses: 共有回答 ===
CREATE TABLE IF NOT EXISTS responses (
    id SERIAL PRIMARY KEY,
    linkid TEXT NOT NULL,
    username TEXT NOT NULL,
    answers JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
