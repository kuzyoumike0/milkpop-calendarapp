-- ===== schedules: 共有スケジュール =====
CREATE TABLE IF NOT EXISTS schedules (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    dates JSONB NOT NULL,         -- 日付の配列（文字列で保存）
    options JSONB,                -- 朝/昼/夜/中締めなどの設定
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== schedule_responses: 出欠回答 =====
CREATE TABLE IF NOT EXISTS schedule_responses (
    schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,        -- Discord ID または匿名ユーザーID
    username TEXT NOT NULL,       -- 表示名（最新の名前に上書き）
    responses JSONB NOT NULL,     -- { "2025-08-01": "〇", "2025-08-02": "✖" } など
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (schedule_id, user_id)
);

-- ===== personal_schedules: 個人用スケジュール =====
CREATE TABLE IF NOT EXISTS personal_schedules (
    id UUID PRIMARY KEY,
    share_id UUID NOT NULL,       -- 紐づく共有スケジュールID
    title TEXT NOT NULL,
    memo TEXT,
    dates JSONB NOT NULL,
    options JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
