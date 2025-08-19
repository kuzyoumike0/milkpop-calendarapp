-- 既存テーブルを削除（依存関係ごと消す）
DROP TABLE IF EXISTS responses CASCADE;
DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS links CASCADE;

-- links テーブル
CREATE TABLE links (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 候補日程
CREATE TABLE schedules (
    id SERIAL PRIMARY KEY,
    link_id TEXT NOT NULL,
    date DATE NOT NULL,
    timeslot TEXT NOT NULL,
    starttime TEXT,
    endtime TEXT,
    FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE
);

-- 回答（◯ ×）
CREATE TABLE responses (
    id SERIAL PRIMARY KEY,
    link_id TEXT NOT NULL,
    date DATE NOT NULL,
    timeslot TEXT NOT NULL,
    username TEXT NOT NULL,
    choice TEXT NOT NULL CHECK (choice IN ('◯', '×')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE
);
