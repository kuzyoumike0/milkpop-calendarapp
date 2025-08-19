-- schedules: 登録された日程（タイトル・日付・時間帯）
CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    share_id TEXT NOT NULL,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    mode TEXT NOT NULL,         -- "range" or "multiple"
    start_time TIME,            -- 時間帯指定（任意）
    end_time TIME,              -- 時間帯指定（任意）
    created_at TIMESTAMP DEFAULT NOW()
);

-- share_links: 共有リンク発行管理
CREATE TABLE IF NOT EXISTS share_links (
    id SERIAL PRIMARY KEY,
    share_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- responses: ユーザーの出欠回答（名前＋○×）
CREATE TABLE IF NOT EXISTS responses (
    id SERIAL PRIMARY KEY,
    share_id TEXT NOT NULL REFERENCES share_links(share_id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('◯','×')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_schedules_shareid ON schedules (share_id);
CREATE INDEX IF NOT EXISTS idx_responses_shareid ON responses (share_id);
