-- ===============================
-- schedules テーブル
-- 個人予定 + 共有予定を保存する
-- ===============================
CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,                -- 自動採番
    username TEXT NOT NULL,               -- ユーザー名
    date DATE NOT NULL,                   -- 日付
    timeslot TEXT NOT NULL,               -- 時間帯（全日/昼/夜）
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 登録日時
    linkId TEXT                           -- 共有リンクID
);

-- ===============================
-- share_links テーブル
-- 共有リンクそのものを管理
-- ===============================
CREATE TABLE IF NOT EXISTS share_links (
    linkId TEXT PRIMARY KEY,              -- UUID形式の共有リンクID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- 作成日時
);
