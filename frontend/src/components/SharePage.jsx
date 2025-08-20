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

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-[#FDB9C8]">{schedule.title}</h2>
      <input
        className="w-full mb-3 p-2 text-black rounded"
        placeholder="あなたの名前"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      {/* 日程 × 回答 */}
      <table className="w-full border border-gray-600 text-center">
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
        className="mt-6 w-full bg-[#FDB9C8] text-black py-2 rounded-2xl hover:bg-[#004CA0] hover:text-white"
        onClick={handleSave}
      >
        保存
      </button>

      {/* 全員分の回答一覧 */}
      <h3 className="text-xl mt-8 mb-2 text-[#FDB9C8]">みんなの回答</h3>
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
