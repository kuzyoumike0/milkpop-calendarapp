import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function SharePage() {
  const { linkid } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [username, setUsername] = useState("");
  const [responses, setResponses] = useState({}); // { schedule_id: "〇" or "✖" }

  // 共有スケジュール取得
  const fetchSchedules = async () => {
    try {
      const res = await axios.get(`/api/share/${linkid}`);
      setSchedules(res.data);
    } catch (err) {
      console.error("共有スケジュール取得失敗:", err);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [linkid]);

  // 保存処理
  const handleSave = async () => {
    if (!username) {
      alert("ユーザー名を入力してください");
      return;
    }

    try {
      const promises = Object.entries(responses).map(([schedule_id, response]) =>
        axios.post("/api/response", {
          username,
          schedule_id,
          response,
        })
      );
      await Promise.all(promises);

      // ✅ 自分の回答を即時反映
      setSchedules((prev) =>
        prev.map((s) => {
          if (responses[s.schedule_id]) {
            const otherResponses = (s.responses || []).filter(
              (r) => r.username !== username
            );
            return {
              ...s,
              responses: [
                ...otherResponses,
                { username, response: responses[s.schedule_id] },
              ],
            };
          }
          return s;
        })
      );

      alert("回答を保存しました ✅");
    } catch (err) {
      console.error("回答保存失敗:", err);
    }
  };

  // === データを「日付 × 時間帯」単位に整形 ===
  const grouped = schedules.map((s) => ({
    schedule_id: s.schedule_id,
    date: s.start_date === s.end_date ? s.start_date : `${s.start_date} ~ ${s.end_date}`,
    timeslot: s.timeslot,
    responses: s.responses || [],
  }));

  // === すべてのユーザー名を抽出（列ヘッダ用） ===
  const allUsers = Array.from(
    new Set(
      grouped.flatMap((s) => s.responses.map((r) => r.username))
    )
  );

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <header className="text-center text-3xl font-bold mb-6 text-[#FDB9C8]">
        MilkPOP Calendar - 共有スケジュール
      </header>

      <div className="bg-[#004CA0] rounded-2xl p-6 shadow-lg mb-6 overflow-x-auto">
        <input
          type="text"
          placeholder="ユーザー名を入力"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 mb-4 rounded text-black"
        />

        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-[#FDB9C8] text-black">
              <th className="p-2">日付</th>
              <th className="p-2">時間帯</th>
              {allUsers.map((u, i) => (
                <th key={i} className="p-2">{u}</th>
              ))}
              <th className="p-2">自分の回答</th>
            </tr>
          </thead>
          <tbody>
            {grouped.map((s) => (
              <tr key={s.schedule_id} className="border-b border-gray-700">
                <td className="p-2">{s.date}</td>
                <td className="p-2">{s.timeslot}</td>
                {allUsers.map((u, i) => {
                  const ans = s.responses.find((r) => r.username === u);
                  return (
                    <td key={i} className="p-2 text-center">
                      {ans ? (
                        <span
                          className={
                            ans.response === "〇" ? "text-green-400 font-bold" : "text-red-400 font-bold"
                          }
                        >
                          {ans.response}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                  );
                })}
                <td className="p-2">
                  <select
                    value={responses[s.schedule_id] || ""}
                    onChange={(e) =>
                      setResponses({
                        ...responses,
                        [s.schedule_id]: e.target.value,
                      })
                    }
                    className="p-1 rounded text-black"
                  >
                    <option value="">未回答</option>
                    <option value="〇">〇</option>
                    <option value="✖">✖</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          onClick={handleSave}
          className="mt-4 bg-[#FDB9C8] text-black px-4 py-2 rounded-xl font-bold"
        >
          保存
        </button>
      </div>
    </div>
  );
}
