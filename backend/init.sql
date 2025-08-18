-- ================================
-- DB初期化スクリプト
-- ================================

-- 共有リンクテーブル
CREATE TABLE IF NOT EXISTS share_links (
    id SERIAL PRIMARY KEY,               -- 内部管理用ID
    share_id TEXT UNIQUE NOT NULL,       -- 共有リンク用UUID
    created_at TIMESTAMP DEFAULT NOW()   -- 作成日時
);

-- 個人スケジュールテーブル
CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL,              -- ユーザー名
    date DATE NOT NULL,                  -- 日付
    slotmode TEXT NOT NULL,              -- 範囲 or 複数
    slot TEXT NOT NULL,                  -- 終日/昼/夜
    start_time TEXT,                     -- 開始時刻
    end_time TEXT,                       -- 終了時刻
    title TEXT,                          -- 予定タイトル
    share_id TEXT REFERENCES share_links(share_id) ON DELETE CASCADE
);

-- インデックスで高速化
CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(date);
CREATE INDEX IF NOT EXISTS idx_schedules_share_id ON schedules(share_id);
