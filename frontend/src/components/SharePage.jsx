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
    await axios.post(`/api/share/${linkid}/response`, {
      username,
      answers,
    });
    fetchData();
  };

  if (!schedule) return <p className="text-white">読み込み中...</p>;

  return (
    <div className="min-h-screen p-6 flex flex-col items-center">
      <div className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-xl rounded-2xl p-6 w-full max-w-4xl">
        <h2 className="text-xl font-bold text-white mb-4">
          📅 {schedule.title}
        </h2>

        <input
          type="text"
          placeholder="あなたの名前"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mb-4 w-full p-2 rounded bg-black/40 text-white"
        />

        <table className="w-full text-center border-collapse mb-4">
          <thead>
            <tr className="bg-black/40 text-white">
              <th className="p-2 border border-white/20">日付</th>
              <th className="p-2 border border-white/20">選択</th>
            </tr>
          </thead>
          <tbody>
            {schedule.dates.map((d) => (
              <tr key={d} className="hover:bg-white/10">
                <td className="p-2 border border-white/20 text-white">{d}</td>
                <td className="p-2 border border-white/20">
                  <select
                    value={answers[d] || ""}
                    onChange={(e) => handleAnswerChange(d, e.target.value)}
                    className="bg-black/40 text-white rounded p-1"
                  >
                    <option value="">選択</option>
                    <option value="○">○</option>
                    <option value="✕">✕</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          onClick={handleSave}
          className="px-6 py-2 rounded-lg bg-[#FDB9C8] text-black font-bold shadow hover:bg-[#fda5b7] transition"
        >
          保存
        </button>
      </div>

      {/* 回答一覧 */}
      <div className="mt-6 backdrop-blur-lg bg-white/20 border border-white/30 shadow-xl rounded-2xl p-6 w-full max-w-4xl">
        <h3 className="text-lg font-bold text-white mb-2">📊 回答一覧</h3>
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="bg-black/40 text-white">
              <th className="p-2 border border-white/20">ユーザー</th>
              {schedule.dates.map((d) => (
                <th key={d} className="p-2 border border-white/20">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {responses.map((r, i) => (
              <tr key={i} className="hover:bg-white/10 text-white">
                <td className="p-2 border border-white/20">{r.username}</td>
                {schedule.dates.map((d) => (
                  <td
                    key={d}
                    className="p-2 border border-white/20"
                  >
                    {r.answers[d] || "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
