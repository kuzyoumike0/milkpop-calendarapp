// frontend/src/components/SharePage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Calendar from "react-calendar";
import "../index.css";

const SharePage = () => {
  const { id } = useParams(); // URLの /share/:id から取得
  const [schedule, setSchedule] = useState(null);
  const [holidays, setHolidays] = useState([]);

  // ===== 日本時間の今日 =====
  const todayJST = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" })
  );
  const todayStr = todayJST.toISOString().split("T")[0];

  // ===== 祝日取得 =====
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const res = await fetch("https://holidays-jp.github.io/api/v1/date.json");
        const data = await res.json();
        setHolidays(Object.keys(data));
      } catch (err) {
        console.error("祝日取得失敗:", err);
      }
    };
    fetchHolidays();
  }, []);

  // ===== スケジュール取得 =====
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch(`/api/schedules/${id}`);
        if (!res.ok) throw new Error("スケジュール取得失敗");
        const data = await res.json();
        setSchedule(data);
      } catch (err) {
        console.error("取得エラー:", err);
      }
    };
    fetchSchedule();
  }, [id]);

  if (!schedule) return <p>📡 読み込み中...</p>;

  return (
    <div className="page-container">
      <h1 className="page-title">🔗 共有スケジュール</h1>
      <h2 className="font-bold text-xl mb-4">{schedule.title || "（タイトルなし）"}</h2>

      <div className="flex flex-col md:flex-row gap-6">
        {/* ===== カレンダー表示 ===== */}
        <div className="flex-1">
          <Calendar
            tileClassName={({ date }) => {
              const dateStr = date.toISOString().split("T")[0];
              if (dateStr === todayStr) return "today-highlight";
              if (holidays.includes(dateStr)) return "holiday";

              const scheduled = schedule.dates.some((d) => d.date === dateStr);
              if (scheduled) return "selected-date";

              if (date.getDay() === 0) return "sunday";
              if (date.getDay() === 6) return "saturday";
              return "";
            }}
          />
        </div>

        {/* ===== 日程リスト ===== */}
        <div className="flex-1">
          <h3 className="font-bold mb-2">📝 登録された日程</h3>
          <ul className="list-disc list-inside">
            {schedule.dates.map((d, i) => (
              <li key={i}>
                {d.date} — {d.type}
                {d.type === "時間指定" && ` (${d.start}〜${d.end})`}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SharePage;
