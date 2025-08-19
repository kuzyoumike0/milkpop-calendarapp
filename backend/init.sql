-- =========================
-- Schedules (日程情報)
-- =========================
CREATE TABLE IF NOT EXISTS schedules (
    id UUID PRIMARY KEY,                -- スケジュールID (UUID)
    link_id UUID NOT NULL,              -- リンクID (共有リンクごとにグルーピング)
    title TEXT NOT NULL,                -- タイトル
    date DATE NOT NULL,                 -- 日付
    timeslot TEXT NOT NULL,             -- 全日 / 昼 / 夜 / custom
    starttime INT,                      -- custom の場合の開始時刻
    endtime INT                         -- custom の場合の終了時刻
);

-- =========================
-- Responses (参加者の回答)
-- =========================
CREATE TABLE IF NOT EXISTS responses (
    id UUID PRIMARY KEY,                -- 回答ID (UUID)
    schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    link_id UUID NOT NULL,              -- 紐づく共有リンク
    date DATE NOT NULL,                 -- 回答対象の日付
    timeslot TEXT NOT NULL,             -- 回答対象の時間帯
    username TEXT NOT NULL,             -- 回答者名
    choice TEXT NOT NULL                -- ◯ or ×
);

-- =========================
-- インデックス
-- =========================
CREATE INDEX IF NOT EXISTS idx_schedules_link_id ON schedules(link_id);
CREATE INDEX IF NOT EXISTS idx_responses_schedule_id ON responses(schedule_id);
CREATE INDEX IF NOT EXISTS idx_responses_link_id ON responses(link_id);
