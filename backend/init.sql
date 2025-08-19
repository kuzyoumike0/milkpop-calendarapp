-- schedules テーブル
DROP TABLE IF EXISTS schedules CASCADE;
CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- UUIDに修正
    linkId UUID NOT NULL,
    date DATE NOT NULL,
    timeslot TEXT NOT NULL,
    startTime TIME,
    endTime TIME
);

-- responses テーブル
DROP TABLE IF EXISTS responses;
CREATE TABLE responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE, -- ここをUUIDに修正
    linkId UUID NOT NULL,
    date DATE NOT NULL,
    timeslot TEXT NOT NULL,
    username TEXT NOT NULL,
    choice TEXT NOT NULL
);

-- links テーブル
DROP TABLE IF EXISTS links;
CREATE TABLE links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL
);
