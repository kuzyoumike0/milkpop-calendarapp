import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function SharePage() {
  const { linkid } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [responses, setResponses] = useState([]);
  const [username, setUsername] = useState("");
  const [answers, setAnswers] = useState({});

  const fetchData = async () => {
    const res = await axios.get(`/api/schedule/${linkid}`);
    setSchedule(res.data.schedules[0]);
    setResponses(res.data.responses);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAnswerChange = (date, value) => {
    setAnswers((prev) => ({ ...prev, [date]: value }));
  };

  const handleSave = async () => {
    await axios.post(`/api/share/${linkid}/response`, { username, answers });
    fetchData(); // 即時反映
  };

  if (!schedule) return <p>読み込み中...</p>;

  const getTimeLabel = () => {
    const s = schedule.start_time;
    const e = schedule.end_time;
    if (s === "01:00" && e === "24:00") return "終日";
    if (s === "09:00" && e === "18:00") return "昼";
    if (s === "18:00" && e === "24:00") return "夜";
    return `${s} 〜 ${e}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-2">
      {/* タイトル */}
      <h2 className="text-3xl font-bold mb-2 text-[#FDB9C8]">
        {schedule.title}
      </h2>

      {/* 時間帯ラベル */}
      <p className="mb-6 text-gray-300">
        時間帯:{" "}
        <span className="text-[#004CA0] font-semibold">{getTimeLabel()}</span>
      </p>

      {/* 名前入力 */}
      <input
        className="w-full mb-4 p-2 text-black rounded"
        placeholder="あなたの名前を入力"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      {/* 回答フォーム（日程ごと） */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {schedule.dates.map((date) => (
          <div
            key={date}
            className="p-4 bg-gray-900 rounded-2xl shadow-lg border border-gray-700 flex flex-col"
          >
            <p className="font-semibold text-[#FDB9C8] mb-2">{date}</p>
            <select
              className="text-black rounded p-1"
              value={answers[date] || ""}
              onChange={(e) => handleAnswerChange(date, e.target.value)}
            >
              <option value="">未回答</option>
              <option value="○">○</option>
              <option value="✖">✖</option>
            </select>
          </div>
        ))}
      </div>

      <button
        className="w-full bg-[#FDB9C8] text-black py-2 rounded-2xl hover:bg-[#004CA0] hover:text-white shadow-lg"
        onClick={handleSave}
      >
        保存
      </button>

      {/* 全員分の回答一覧 */}
      <h3 className="text-xl mt-10 mb-4 text-[#FDB9C8]">みんなの回答</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {responses.map((r, idx) => (
          <div
            key={idx}
            className="p-4 bg-gray-900 rounded-2xl shadow-lg border border-gray-700"
          >
            <h4 className="text-lg font-semibold text-[#FDB9C8] mb-2">
              {r.username}
            </h4>
            {schedule.dates.map((d) => (
              <p key={d} className="text-gray-300 text-sm">
                <span className="font-semibold text-white">{d}:</span>{" "}
                {r.answers[d] || "-"}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
