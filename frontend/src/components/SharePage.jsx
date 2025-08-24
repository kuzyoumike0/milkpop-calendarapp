import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const SharePage = () => {
  const { token } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [responses, setResponses] = useState([]);
  const [userName, setUserName] = useState("");
  const [answers, setAnswers] = useState({});

  // スケジュール取得
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch(`/share/${token}`);
        const data = await res.json();
        setSchedule(data);
        if (data.id) {
          fetchResponses(data.id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSchedule();
  }, [token]);

  // 出欠一覧取得
  const fetchResponses = async (id) => {
    try {
      const res = await fetch(`/api/schedules/${id}/responses`);
      const data = await res.json();
      setResponses(data);
    } catch (err) {
      console.error(err);
    }
  };

  // 出欠保存
  const handleSave = async () => {
    if (!userName) {
      alert("名前を入力してください");
      return;
    }
    try {
      const res = await fetch(`/api/schedules/${schedule.id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userName, // 簡易的に user_id = userName とする
          username: userName,
          responses: answers,
        }),
      });
      await res.json();
      fetchResponses(schedule.id);
    } catch (err) {
      console.error(err);
    }
  };

  if (!schedule) return <div>読み込み中...</div>;

  return (
    <div className="page-container">
      <h2 className="text-xl font-bold mb-4">共有スケジュール: {schedule.title}</h2>

      <div className="mb-4">
        <input
          type="text"
          placeholder="あなたの名前"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="p-2 rounded w-64"
        />
      </div>

      {/* 出欠選択 */}
      <div>
        {schedule.dates.map((date) => (
          <div key={date} className="mb-2">
            <span className="mr-2">{date}</span>
            <select
              value={answers[date] || ""}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, [date]: e.target.value }))
              }
              className="p-1 rounded"
            >
              <option value="">選択してください</option>
              <option value="〇">〇</option>
              <option value="✕">✕</option>
            </select>
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
      >
        出欠を保存
      </button>

      {/* 全員の一覧 */}
      <h3 className="text-lg font-bold mt-6 mb-2">全員の出欠一覧</h3>
      <table className="border-collapse border border-gray-400 w-full">
        <thead>
          <tr>
            <th className="border p-2">名前</th>
            {schedule.dates.map((d) => (
              <th key={d} className="border p-2">{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {responses.map((r, idx) => (
            <tr key={idx}>
              <td className="border p-2">{r.username}</td>
              {schedule.dates.map((d) => (
                <td key={d} className="border p-2">
                  {r.responses[d] || "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SharePage;
