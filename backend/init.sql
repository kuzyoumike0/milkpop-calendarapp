DROP TABLE IF EXISTS schedules;

CREATE TABLE schedules (
    id TEXT PRIMARY KEY,           -- UUID
    username TEXT NOT NULL,        -- 投稿者
    date DATE NOT NULL,            -- 日付
    category TEXT NOT NULL,        -- 区分 (終日/昼/夜/時間帯)
    startTime TEXT,                -- 開始時刻 (時間帯指定時のみ)
    endTime TEXT,                  -- 終了時刻 (時間帯指定時のみ)
    linkId TEXT NOT NULL           -- 共有リンクの識別子
);
