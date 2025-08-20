import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function SharePage() {
  const { linkid } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [responses, setResponses] = useState([]);
  const [username, setUsername] = useState("");
  const [answers, setAnswers] = useState({});

  // データ取得
  const fetchData = async () => {
    const res = await axios.get(`/api/schedule/${linkid}`);
    setSchedule(res.data.schedules[0]);
    setResponses(res.data.responses);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 選択変更
  const handleAnswerChange = (date, value) => {
    setAnswers((prev) => ({ ...prev, [date]: value }));
  };

  // 保存処理
  const handleSave = async () => {
    await axios.post(`/api/share/${linkid}/response`, {
      username,
      answers,
    });
    fetchData();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* タイトル */}
      <h1 className="text-3xl font-bold text-center text-[#FDB9C8] mb-8">
        共有スケジュール
      </h1>

      {/* スケジュール情報 */}
      {schedule && (
        <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#FDB9C8] mb-2">
            {schedule.title}
          </h2>
          <p className="text-gray-400">
            選択モード: {schedule.range_mode === "range" ? "範囲選択" : "複数選択"}
          </p>
        </div>
      )}

      {/* ユーザー入力 */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6 mb-6">
        <label className="block mb-2 text-gray-300">ユーザー名</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 rounded-lg border border-gray-600 bg-black text-white mb-4"
        />

        {/* 日付ごとの回答 */}
        {schedule &&
          schedule.dates &&
          schedule.dates.map((date) => (
            <div
              key={date}
              className="bg-black border border-gray-700 rounded-xl p-4 mb-4"
            >
              <p className="text-[#FDB9C8] font-semibold mb-2">{date}</p>
              <select
                value={answers[date] || ""}
                onChange={(e) => handleAnswerChange(date, e.target.value)}
                className="w-full p-2 rounded-lg border border-gray-600 bg-gray-800 text-white"
              >
                <option value="">選択してください</option>
                <option value="〇">〇</option>
                <option value="✖">✖</option>
              </select>
            </div>
          ))}

        <button
          onClick={handleSave}
          className="w-full bg-[#004CA0] hover:bg-[#003580] text-white py-2 rounded-xl font-bold shadow-lg transition"
        >
          保存
        </button>
      </div>

      {/* 回答一覧 */}
      <h2 className="text-2xl font-bold text-[#FDB9C8] mb-4 text-center">
        回答一覧
      </h2>
      <div className="grid gap-4">
        {responses.map((res, idx) => (
          <div
            key={idx}
            className="bg-gray-900 border border-gray-700 rounded-2xl shadow-md p-4"
          >
            <h3 className="text-lg font-semibold text-[#FDB9C8] mb-2">
              {res.username}
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(res.answers).map(([date, ans]) => (
                <span
                  key={date}
                  className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300"
                >
                  {date}:{" "}
                  <span
                    className={
                      ans === "〇" ? "text-green-400 font-bold" : "text-red-400"
                    }
                  >
                    {ans}
                  </span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
