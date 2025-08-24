// frontend/src/components/SharePage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Holidays from "date-holidays";
import "../index.css";

const SharePage = () => {
  const { token } = useParams();
  const [schedule, setSchedule] = useState(null);

  const jstNow = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" })
  );
  const hd = new Holidays("JP");

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL || ""}/share/${token}`
        );
        const data = await res.json();
        setSchedule(data);
      } catch (err) {
        console.error("共有スケジュール取得エラー:", err);
      }
    };
    fetchSchedule();
  }, [token]);

  if (!schedule) {
    return <p className="text-center mt-10">⏳ 読み込み中...</p>;
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-[#FDB9C8] to-[#004CA0] text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 drop-shadow-md">
          📅 {schedule.title}
        </h1>
        <div className="space-y-4">
          {schedule.dates.map((d, i) => {
            const dateObj = new Date(d);
            const holiday = hd.isHoliday(dateObj);
            const isToday =
              dateObj.getFullYear() === jstNow.getFullYear() &&
              dateObj.getMonth() === jstNow.getMonth() &&
              dateObj.getDate() === jstNow.getDate();

            return (
              <div
                key={i}
                className={`p-4 rounded-2xl shadow-lg ${
                  isToday ? "bg-yellow-400 text-black" : "bg-black bg-opacity-50"
                }`}
              >
                <p className="text-lg font-semibold">
                  {d}
                  {holiday && (
                    <span className="ml-2 text-red-400 font-bold">
                      {holiday[0].name}
                    </span>
                  )}
                  {isToday && <span className="ml-2">✨ 今日</span>}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SharePage;
