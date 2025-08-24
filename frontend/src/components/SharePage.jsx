// frontend/src/components/SharePage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Holidays from "date-holidays";
import "../index.css";

const SharePage = () => {
  const { token } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [responses, setResponses] = useState({});
  const [username, setUsername] = useState("");
  const hd = new Holidays("JP");

  // 日本時間の今日
  const jstNow = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" })
  );

  // 📌 スケジュール取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL || ""}/share/${token}`
        );
        const data = await res.json();
        setSchedule(data);

        // 初期回答状態（全て未回答）
        const init = {};
        data.dates.forEach((d) => {
          init[d] = "未回答";
        });
        setResponses(init);
      } catch (err) {
        console.error("共有リンク取得エラー:", err);
      }
    };
    fetchData();
  }, [token]);

  // 📌 回答選択変更
  const handleResponseChange = (date, value) => {
    setResponses((prev) => ({ ...prev, [date]: value }));
  };

  // 📌 回答保存
  const saveResponses = async () => {
    if (!username) {
      alert("名前を入力してください");
      return;
    }
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || ""}/api/schedules/${schedule.id}/responses`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: username, // 仮に名前をIDとして使う（本来はOAuthユーザーIDなど）
            username,
            responses,
          }),
        }
      );
      const data = await res.json();
      console.log("保存成功:", data);
      alert("保存しました！");
    } catch (err) {
      console.error("保存エラー:", err);
      alert("保存に失敗しました");
    }
  };

  if (!schedule) {
    return <p className="text-center mt-10">⏳ 読み込み中...</p>;
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-[#FDB9C8] to-[#004CA0] text-white">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6 drop-shadow-md">
          📅 {schedule.title}
        </h1>

        {/* 名前入力 */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="あなたの名前を入力"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 rounded-lg text-black"
          />
        </div>

        {/* 日程リスト */}
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
                className={`p-4 rounded-2xl shadow-lg flex justify-between items-center ${
                  isToday ? "bg-yellow-300 text-black" : "bg-black bg-opacity-50"
                }`}
              >
                <div>
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

                {/* 回答プルダウン */}
                <select
                  className="p-2 rounded-lg text-black"
                  value={responses[d] || "未回答"}
                  onChange={(e) => handleResponseChange(d, e.target.value)}
                >
                  <option value="未回答">未回答</option>
                  <option value="〇">〇 参加可</option>
                  <option value="✕">✕ 不可</option>
                </select>
              </div>
            );
          })}
        </div>

        {/* 保存ボタン */}
        <div className="text-center mt-6">
          <button
            onClick={saveResponses}
            className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-lg shadow-md"
          >
            💾 保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default SharePage;
