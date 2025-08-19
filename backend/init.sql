-- === schedules: 日程情報（共有リンクごと） ===
CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    linkId TEXT NOT NULL,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    timeSlot TEXT NOT NULL
);

-- === responses: 出欠回答 ===
CREATE TABLE IF NOT EXISTS responses (
    id SERIAL PRIMARY KEY,
    linkId TEXT NOT NULL,
    name TEXT NOT NULL,
    responses JSONB NOT NULL
);

-- インデックス最適化
CREATE INDEX IF NOT EXISTS idx_schedules_linkId ON schedules(linkId);
CREATE INDEX IF NOT EXISTS idx_responses_linkId ON responses(linkId);
