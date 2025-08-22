// holidays-jp APIを使って日本の祝日を取得する
// 参考: https://holidays-jp.github.io/

let holidayCache = null;

// 祝日一覧を取得（キャッシュ付き）
export const fetchHolidays = async () => {
  if (holidayCache) return holidayCache;

  try {
    const res = await fetch("https://holidays-jp.github.io/api/v1/date.json");
    if (!res.ok) throw new Error("Failed to fetch holidays");
    const data = await res.json();
    // data は { "2025-01-01": "元日", ... } の形式
    holidayCache = Object.keys(data);
    return holidayCache;
  } catch (err) {
    console.error("祝日の取得に失敗しました:", err);
    return [];
  }
};

// 今日（日本時間）のISO日付を取得
export const getTodayIso = () => {
  const now = new Date();
  const jst = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  return jst.toISOString().split("T")[0];
};

// 指定日が祝日か判定
export const isHoliday = async (date) => {
  const holidays = await fetchHolidays();
  const iso = date.toISOString().split("T")[0];
  return holidays.includes(iso);
};
