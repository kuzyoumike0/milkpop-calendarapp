// frontend/src/components/SharePage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../index.css";

const SharePage = () => {
  const { shareId } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [responses, setResponses] = useState({});

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL || ""}/api/schedules/${shareId}`
        );
        const data = await res.json();
        setSchedules(data.dates || []);
      } catch (err) {
        console.error("共有データ取得エラー:", err);
      }
    };
    fetchSchedules();
  }, [shareId]);

  const handleSave = async () => {
    try {
      await fetch(
        `${process.env.REACT_APP_API_URL || ""}/api/schedules/${shareId}/responses`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(responses),
        }
      );
      alert("保存しました！");
    } catch (err) {
      console.error("保存エラー:", err);
      alert("保存に失敗しました");
    }
  };

  const handleChange = (date, value) => {
    setResponses((prev) => ({ ...prev, [date]: value }));
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-[#FDB9C8] to-[#004CA0] text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 drop-shadow-md">
          📅 共有された日程
        </h1>
        {schedules.length === 0 ? (
          <p className="text-center text-lg">日程が登録されていません。</p>
        ) : (
          <div className="space-y-4">
            {schedules.map((item, idx) => (
              <div
                key={idx}
                className="bg-black bg-opacity-40 p-4 rounded-2xl shadow-lg flex justify-between items-center"
              >
                <div>
                  <p className="text-lg font-semibold">{item.date}</p>
                  <p className="text-sm opacity-80">
                    {item.timerange?.type === "custom"
                      ? `${item.timerange.start}〜${item.timerange.end}`
                      : item.timerange?.type || "終日"}
                  </p>
                </div>
                <div>
                  <select
                    className="bg-white text-black px-3 py-1 rounded-lg shadow"
                    value={responses[item.date] || "未選択"}
                    onChange={(e) => handleChange(item.date, e.target.value)}
                  >
                    <option value="未選択">未選択</option>
                    <option value="〇">〇</option>
                    <option value="✖">✖</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
        {schedules.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={handleSave}
              className="bg-gradient-to-r from-[#FDB9C8] to-[#004CA0] px-6 py-3 rounded-xl shadow-xl font-bold text-lg hover:opacity-90 transition"
            >
              💾 保存して反映
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharePage;
