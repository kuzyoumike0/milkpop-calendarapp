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

  // 時間帯ラベル判定
  const getTimeLabel = () => {
    const s = schedule.start_time;
    const e = schedule.end_time;
    if (s === "01:00" && e === "24:00") return "終日";
    if (s === "09:00" && e === "18:00") return "昼";
    if (s === "18:00" && e === "24:00") return "夜";
    return `${s} 〜 ${e}`;
  };

  return (
    <div className="max-w-4xl mx-auto">
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

      {/* 日程 × 回答 */}
      <table className="w-full border border-gray-600 text-center mb-6">
        <thead className="bg-[#004CA0] text-white">
          <tr>
            <th className="p-2">日付</th>
            <th className="p-2">回答</th>
          </tr>
        </thead>
        <tbody>
          {schedule.dates.map((date) => (
            <tr key={date} className="border-b border-gray-600">
              <td className="p-2">{date}</td>
              <td className="p-2">
                <select
                  className="text-black rounded"
                  value={answers[date] || ""}
                  onChange={(e) => handleAnswerChange(date, e.target.value)}
                >
                  <option value="">未回答</option>
                  <option value="○">○</option>
                  <option value="✖">✖</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        className="w-full bg-[#FDB9C8] text-black py-2 rounded-2xl hover:bg-[#004CA0] hover:text-white shadow-lg"
        onClick={handleSave}
      >
        保存
      </button>

      {/* 全員分の回答一覧 */}
      <h3 className="text-xl mt-10 mb-3 text-[#FDB9C8]">みんなの回答</h3>
      <table className="w-full border border-gray-600 text-center">
        <thead className="bg-gray-800">
          <tr>
            <th className="p-2">名前</th>
            {schedule.dates.map((d) => (
              <th key={d} className="p-2">{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {responses.map((r, idx) => (
            <tr key={idx} className="border-b border-gray-600">
              <td className="p-2">{r.username}</td>
              {schedule.dates.map((d) => (
                <td key={d} className="p-2">{r.answers[d] || "-"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
