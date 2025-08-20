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

  // 回答変更
  const handleAnswerChange = (date, value) => {
    setAnswers((prev) => ({ ...prev, [date]: value }));
  };

  // 保存処理
  const handleSave = async () => {
    await axios.post(`/api/share/${linkid}/response`, {
      username,
      answers,
    });
    fetchData(); // 保存後に即反映
  };

  if (!schedule) return <p className="text-white">読み込み中...</p>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 backdrop-blur-lg bg-white/10 rounded-2xl shadow-xl">
      <h2 className="text-2xl font-bold text-white text-center mb-6">
        共有スケジュール: {schedule.title}
      </h2>

      {/* 名前入力 */}
      <div className="mb-6 text-center">
        <input
          type="text"
          placeholder="あなたの名前を入力"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="px-4 py-2 rounded-lg border border-white/30 bg-black/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FDB9C8]"
        />
      </div>

      {/* テーブル表示 */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-white text-center shadow-md">
          <thead>
            <tr className="bg-[#004CA0]/70">
              <th className="p-3 border border-white/20">ユーザー</th>
              {schedule.dates.map((d, idx) => (
                <th key={idx} className="p-3 border border-white/20">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* 既存回答 */}
            {responses.map((res, i) => (
              <tr
                key={i}
                className="hover:bg-white/10 transition border-b border-white/10"
              >
                <td className="p-2 font-semibold">{res.username}</td>
                {schedule.dates.map((d, idx) => (
                  <td key={idx} className="p-2">
                    {res.answers[d] || "-"}
                  </td>
                ))}
              </tr>
            ))}

            {/* 自分の回答 */}
            <tr className="bg-black/30">
              <td className="p-2 font-semibold text-[#FDB9C8]">あなた</td>
              {schedule.dates.map((d, idx) => (
                <td key={idx} className="p-2">
                  <select
                    value={answers[d] || ""}
                    onChange={(e) => handleAnswerChange(d, e.target.value)}
                    className="px-2 py-1 rounded-lg bg-white/20 text-black"
                  >
                    <option value="">-</option>
                    <option value="◯">◯</option>
                    <option value="✕">✕</option>
                  </select>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* 保存ボタン */}
      <div className="text-center mt-6">
        <button
          onClick={handleSave}
          className="px-6 py-3 rounded-xl font-bold bg-[#FDB9C8] text-black shadow-md hover:bg-[#fda5b7] transition"
        >
          保存
        </button>
      </div>
    </div>
  );
}
