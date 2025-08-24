// frontend/src/components/SharePage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../index.css";

const SharePage = () => {
  const { token } = useParams();
  const [schedule, setSchedule] = useState(null);

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
          📅 共有スケジュール
        </h1>
        <div className="space-y-4">
          {schedule.dates.map((d, i) => (
            <div
              key={i}
              className="bg-black bg-opacity-50 p-4 rounded-2xl shadow-lg"
            >
              <p className="text-lg font-semibold">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SharePage;
