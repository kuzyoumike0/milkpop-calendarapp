// frontend/src/holiday.js

// 日本時間の今日の日付を YYYY-MM-DD 形式で返す
export const getTodayIso = () => {
  const now = new Date();
  // JST (+9時間補正)
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().split("T")[0];
};

// 日本の祝日を取得（Google Calendar API の Public Holidaysを利用予定）
export const fetchHolidays = async () => {
  try {
    // Googleの祝日カレンダー (日本) iCal JSON API
    const url =
      "https://calendar.google.com/calendar/ical/ja.japanese%23holiday%40group.v.calendar.google.com/public/full.json";

    const res = await fetch(url);
    if (!res.ok) {
      console.error("祝日データ取得に失敗しました");
      return [];
    }

    const data = await res.json();

    // JSON API から日付一覧を抽出
    if (data && data.feed && data.feed.entry) {
      return data.feed.entry.map((item) => {
        const dateStr = item.gd$when?.[0]?.startTime;
        return dateStr ? dateStr.split("T")[0] : null;
      }).filter(Boolean);
    }

    return [];
  } catch (err) {
    console.error("祝日取得エラー:", err);
    return [];
  }
};
