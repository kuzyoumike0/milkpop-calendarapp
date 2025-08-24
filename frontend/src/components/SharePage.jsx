// frontend/src/components/SharePage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../index.css";

const SharePage = () => {
  const { shareId } = useParams(); // URLから共有IDを取得
  const [schedules, setSchedules] = useState([]);
  const [responses, setResponses] = useState({});

  // 初期ロード
  useEffect(() => {
    // 本来はAPIで取得
    const stored = localStorage.getItem(`share-${shareId}`);
    if (stored) {
      setSchedules(JSON.parse(stored));
    }
  }, [shareId]);

  // 保存処理
  const handleSave = () => {
    const stored = localStorage.getItem(`share-${shareId}`);
    const parsed = stored ? JSON.parse(stored) : [];

    const updated = parsed.map((item) => ({
      ...item,
      response: responses[item.date] || item.response || "未選択",
    }));

    localStorage.setItem(`share-${shareId}`, JSON.stringify(updated));
    setSchedules(updated);
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
          <p className="text-center text-lg">
            このリンクにはまだ日程が登録されていません。
          </p>
        ) : (
          <div className="space-y-4">
            {schedules
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .map((item, idx) => (
                <div
                  key={idx}
                  className="bg-black bg-opacity-40 p-4 rounded-2xl shadow-lg flex justify-between items-center"
                >
                  <div>
                    <p className="text-lg font-semibold">{item.title}</p>
                    <p className="text-sm opacity-80">{item.date}</p>
                  </div>
                  <div>
                    <select
                      className="bg-white text-black px-3 py-1 rounded-lg shadow focus:outline-none"
                      value={responses[item.date] || item.response || "未選択"}
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
