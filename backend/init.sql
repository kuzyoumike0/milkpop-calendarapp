-- ===============================
-- Schedules テーブル
-- ===============================
CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,         -- 自動採番ID
    username TEXT NOT NULL,        -- ユーザー名
    date DATE NOT NULL,            -- 日付
    timeslot TEXT NOT NULL,        -- '全日' / '昼' / '夜'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 登録日時
    linkId TEXT                    -- 共有リンクID（外部キー相当）
);

-- ===============================
-- 共有リンクテーブル
-- ===============================
CREATE TABLE IF NOT EXISTS share_links (
    linkId TEXT PRIMARY KEY,       -- UUIDなど
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- 作成日時
);
