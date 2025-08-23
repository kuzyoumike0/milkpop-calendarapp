-- ===== 古い日本語テーブルを削除 =====
DROP TABLE IF EXISTS "スケジュール" CASCADE;
DROP TABLE IF EXISTS "日付" CASCADE;
DROP TABLE IF EXISTS "schedule" CASCADE;

-- ===== schedules: 共有スケジュール =====
CREATE TABLE IF NOT EXISTS schedules (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    dates JSONB NOT NULL,          -- 選択した日付の配列
    options JSONB,                 -- 各日付の時間帯や区分の設定
    share_token TEXT UNIQUE,       -- 共有リンク発行用トークン
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== schedule_responses: 出欠回答 =====
CREATE TABLE IF NOT EXISTS schedule_responses (
    schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,         -- Discord ID または匿名ユーザーID
    username TEXT NOT NULL,        -- 表示名
    responses JSONB NOT NULL,      -- { "2025-08-01": "〇", "2025-08-02": "✖" } 形式
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (schedule_id, user_id)
);

-- ===== personal_schedules: 個人用スケジュール =====
CREATE TABLE IF NOT EXISTS personal_schedules (
    id UUID PRIMARY KEY,
    share_id UUID NOT NULL,        -- 紐づく共有スケジュールID
    title TEXT NOT NULL,
    memo TEXT,
    dates JSONB NOT NULL,          -- 個人の選択した日程
    options JSONB,                 -- 個人の時間帯設定
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_share FOREIGN KEY (share_id) REFERENCES schedules(id) ON DELETE CASCADE
);
