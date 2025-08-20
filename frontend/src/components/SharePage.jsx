import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function SharePage() {
  const { linkId } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [responses, setResponses] = useState([]);
  const [username, setUsername] = useState("");
  const [selected, setSelected] = useState({});

  // スケジュールとレスポンスを取得
  useEffect(() => {
    axios.get(`/api/schedules/${linkId}`).then((res) => setSchedules(res.data));
    axios
      .get(`/api/responses/${linkId}`)
      .then((res) => setResponses(Array.isArray(res.data) ? res.data : []));
  }, [linkId]);

  // 保存
  const handleSave = async () => {
    try {
      await Promise.all(
        Object.entries(selected).map(([scheduleId, response]) =>
          axios.post("/api/responses", {
            scheduleId,
            username,
            response,
          })
        )
      );
      // 再取得
      const res = await axios.get(`/api/responses/${linkId}`);
      setResponses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      alert("保存に失敗しました");
    }
  };

  // responseMap: usernameごとに scheduleId → response
  const responseMap = {};
  responses.forEach((r) => {
    if (!responseMap[r.username]) responseMap[r.username] = {};
    responseMap[r.username][r.scheduleid] = r.response;
  });

  const allUsers = [...new Set(responses.map((r) => r.username))];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <header className="text-center text-2xl font-bold mb-6">
        共有スケジュール
      </header>

      {/* 名前入力 */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="あなたの名前"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="p-2 text-black rounded"
        />
      </div>

      {/* 📌 出欠テーブル */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-700 text-center">
          <thead className="bg-gray-800">
            <tr>
              <th className="border border-gray-700 px-2 py-1">日付</th>
              {allUsers.map((u) => (
                <th
                  key={u}
                  className="border border-gray-700 px-2 py-1 text-pink-300"
                >
                  {u}
                </th>
              ))}
              <th className="border border-gray-700 px-2 py-1">あなた</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s) => (
              <tr key={s.id}>
                <td className="border border-gray-700 px-2 py-1">{s.date}</td>
                {allUsers.map((u) => (
                  <td key={u} className="border border-gray-700 px-2 py-1">
                    {responseMap[u]?.[s.id] || "-"}
                  </td>
                ))}
                <td className="border border-gray-700 px-2 py-1">
                  <select
                    value={selected[s.id] || ""}
                    onChange={(e) =>
                      setSelected({ ...selected, [s.id]: e.target.value })
                    }
                    className="text-black rounded px-1"
                  >
                    <option value="">-</option>
                    <option value="〇">〇</option>
                    <option value="✖">✖</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 保存ボタン */}
      <div className="mt-6 text-center">
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-pink-400 text-black font-bold rounded hover:bg-pink-500"
        >
          保存
        </button>
      </div>
    </div>
  );
}
