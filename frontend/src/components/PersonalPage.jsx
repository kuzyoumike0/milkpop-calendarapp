import React, { useState, useEffect } from "react";
import axios from "axios";

export default function SharePage({ linkId }) {
  const [schedules, setSchedules] = useState([]);
  const [responses, setResponses] = useState({});
  const [username, setUsername] = useState("");

  // === スケジュール取得 ===
  const fetchSchedules = async () => {
    try {
      const res = await axios.get(`/api/share/${linkId}`);
      setSchedules(res.data);
    } catch (err) {
      console.error("共有スケジュール取得失敗:", err);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [linkId]);

  // === 回答変更 ===
  const handleResponseChange = (scheduleId, value) => {
    setResponses((prev) => ({
      ...prev,
      [scheduleId]: value,
    }));
  };

  // === 保存処理 ===
  const handleSave = async () => {
    if (!username) {
      alert("名前を入力してください");
      return;
    }
    try {
      await axios.post(`/api/share/${linkId}/responses`, {
        username,
        responses,
      });
      await fetchSchedules(); // 即時反映
    } catch (err) {
      alert("保存に失敗しました");
      console.error(err);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-[#004CA0]">
        共有スケジュール
      </h2>

      <input
        className="border p-2 mb-4 w-full rounded"
        placeholder="あなたの名前を入力"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <table className="w-full border-collapse text-center shadow">
        <thead>
          <tr className="bg-[#FDB9C8] text-black">
            <th className="border p-2">日付</th>
            <th className="border p-2">時間帯</th>
            <th className="border p-2">タイトル</th>
            <th className="border p-2">参加可否</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((s) => (
            <tr key={s.id}>
              <td className="border p-2">
                {Array.isArray(s.dates) ? s.dates.join(", ") : s.date}
              </td>
              <td className="border p-2">{s.timeslot}</td>
              <td className="border p-2">{s.title}</td>
              <td className="border p-2">
                <select
                  value={responses[s.id] || ""}
                  onChange={(e) =>
                    handleResponseChange(s.id, e.target.value)
                  }
                  className="border p-1 rounded"
                >
                  <option value="">未選択</option>
                  <option value="〇">〇</option>
                  <option value="✕">✕</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={handleSave}
        className="mt-4 px-6 py-2 bg-[#004CA0] text-white rounded-lg shadow hover:bg-[#003580]"
      >
        保存
      </button>
    </div>
  );
}
