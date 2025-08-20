import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function SharePage() {
  const { linkId } = useParams(); // URLからlinkIdを取得
  const [schedules, setSchedules] = useState([]);
  const [responses, setResponses] = useState([]);
  const [selected, setSelected] = useState({});
  const [username, setUsername] = useState("");

  // 📌 日程を取得
  useEffect(() => {
    if (!linkId) return;
    axios
      .get(`/api/schedules/${linkId}`)
      .then((res) => {
        // 日付昇順でソート
        const sorted = [...res.data].sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
        setSchedules(sorted);
      })
      .catch((err) => console.error(err));

    // レスポンスも取得
    axios
      .get(`/api/responses/${linkId}`)
      .then((res) => setResponses(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error(err));
  }, [linkId]);

  // 📌 保存処理
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
      alert("保存しました ✅");
    } catch (err) {
      console.error(err);
      alert("保存に失敗しました");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <header className="text-center text-3xl font-bold text-[#FDB9C8] mb-6">
        MilkPOP Calendar - 出欠登録
      </header>

      <div className="max-w-4xl mx-auto bg-[#004CA0] p-6 rounded-2xl shadow-lg space-y-6">
        {/* ユーザー名入力 */}
        <input
          type="text"
          placeholder="名前を入力"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 rounded-xl text-black"
        />

        {/* 登録された日程一覧 */}
        <div className="overflow-x-auto">
          <table className="w-full text-center bg-white text-black rounded-xl shadow">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2">日付</th>
                <th className="p-2">時間帯</th>
                <th className="p-2">出欠</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="p-2">{s.date}</td>
                  <td className="p-2">{s.timeslot}</td>
                  <td className="p-2">
                    <select
                      value={selected[s.id] || ""}
                      onChange={(e) =>
                        setSelected((prev) => ({
                          ...prev,
                          [s.id]: e.target.value,
                        }))
                      }
                      className="p-2 border rounded-lg"
                    >
                      <option value="">選択してください</option>
                      <option value="◯">◯</option>
                      <option value="✕">✕</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 保存ボタン */}
        <button
          onClick={handleSave}
          className="w-full py-3 bg-[#FDB9C8] text-black rounded-xl font-bold hover:bg-pink-400"
        >
          保存
        </button>

        {/* 登録済みレスポンス */}
        <div className="bg-gray-900 p-4 rounded-xl mt-6">
          <h2 className="font-bold mb-2">登録済みの出欠</h2>
          {responses.length > 0 ? (
            <ul className="space-y-1">
              {responses.map((r) => (
                <li key={r.id}>
                  {r.date} ({r.timeslot}) - {r.username}: {r.response}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">まだ登録がありません</p>
          )}
        </div>
      </div>
    </div>
  );
}
