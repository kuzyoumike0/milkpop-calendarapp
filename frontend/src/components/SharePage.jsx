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

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <header className="text-center text-3xl font-bold mb-6 text-[#FDB9C8]">
        MilkPOP Calendar - 共有スケジュール
      </header>

      <div className="bg-[#004CA0] rounded-2xl p-6 shadow-lg mb-6">
        <input
          type="text"
          placeholder="ユーザー名を入力"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 mb-4 rounded text-black"
        />

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#FDB9C8] text-black">
              <th className="p-2">タイトル</th>
              <th className="p-2">開始日</th>
              <th className="p-2">終了日</th>
              <th className="p-2">時間帯</th>
              <th className="p-2">回答</th>
              <th className="p-2">参加者の回答一覧</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s) => (
              <tr key={s.schedule_id} className="border-b border-gray-700">
                <td className="p-2">{s.title}</td>
                <td className="p-2">{s.start_date}</td>
                <td className="p-2">{s.end_date}</td>
                <td className="p-2">{s.timeslot}</td>
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
                <td className="p-2">
                  {s.responses && s.responses.length > 0 ? (
                    <ul>
                      {s.responses.map((r, i) => (
                        <li key={i}>
                          👤 {r.username} :{" "}
                          <span
                            className={
                              r.response === "〇"
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            {r.response}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-gray-400">まだ回答なし</span>
                  )}
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
