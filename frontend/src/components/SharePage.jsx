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
    try {
      const res = await axios.get(`/api/schedule/${linkid}`);
      setSchedule(res.data.schedules[0]);
      setResponses(res.data.responses);
    } catch (err) {
      console.error("❌ データ取得失敗:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [linkid]);

  // 回答変更
  const handleAnswerChange = (date, value) => {
    setAnswers((prev) => ({ ...prev, [date]: value }));
  };

  // 保存処理
  const handleSave = async () => {
    if (!username.trim()) {
      alert("名前を入力してください");
      return;
    }
    try {
      await axios.post(`/api/share/${linkid}/response`, {
        username,
        answers,
      });
      setAnswers({});
      fetchData();
      alert("✅ 回答を保存しました");
    } catch (err) {
      console.error("❌ 保存失敗:", err);
      alert("保存に失敗しました");
    }
  };

  if (!schedule) return <p>読み込み中...</p>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-[#FDB9C8]">
        共有スケジュール: {schedule.title}
      </h2>

      {/* 名前入力 */}
      <div className="mb-4">
        <label className="mr-2">名前: </label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="p-2 rounded bg-gray-800 text-white"
        />
      </div>

      {/* 自分の回答欄 */}
      <table className="table-auto border-collapse border border-gray-600 w-full mb-6">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="border px-2 py-1">日付</th>
            <th className="border px-2 py-1">自分の回答</th>
          </tr>
        </thead>
        <tbody>
          {schedule.dates.map((d, i) => (
            <tr key={i}>
              <td className="border px-2 py-1">{d}</td>
              <td className="border px-2 py-1">
                <select
                  value={answers[d] || ""}
                  onChange={(e) => handleAnswerChange(d, e.target.value)}
                  className="bg-gray-700 text-white p-1 rounded"
                >
                  <option value="">未選択</option>
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
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        保存
      </button>

      {/* 回答一覧 */}
      <h3 className="text-xl font-semibold mt-8 mb-2">全員の回答一覧</h3>
      <table className="table-auto border-collapse border border-gray-600 w-full">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="border px-2 py-1">ユーザー</th>
            {schedule.dates.map((d, i) => (
              <th key={i} className="border px-2 py-1">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {responses.map((r, i) => {
            const ans = r.answers || {};
            return (
              <tr key={i}>
                <td className="border px-2 py-1">{r.username}</td>
                {schedule.dates.map((d, j) => (
                  <td key={j} className="border px-2 py-1 text-center">
                    {ans[d] || "-"}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
