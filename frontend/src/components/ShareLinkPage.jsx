import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function ShareLinkPage() {
  const { linkid } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [responses, setResponses] = useState({});
  const [username, setUsername] = useState("");

  // データ取得
  useEffect(() => {
    axios
      .get(`/api/share/${linkid}`)
      .then((res) => setSchedules(res.data))
      .catch((err) => console.error("共有リンク取得失敗:", err));
  }, [linkid]);

  // 保存処理
  const saveResponse = async () => {
    try {
      const promises = Object.entries(responses).map(([id, response]) =>
        axios.post("/api/response", {
          username,
          schedule_id: id,
          response,
        })
      );
      await Promise.all(promises);
      alert("保存しました！");
    } catch (err) {
      console.error("保存エラー:", err);
      alert("保存に失敗しました");
    }
  };

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <header className="text-2xl font-bold mb-6 text-[#FDB9C8]">
        MilkPOP Calendar - 共有スケジュール
      </header>

      {/* ユーザー名入力 */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="名前を入力してください"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="p-2 rounded-lg text-black"
        />
      </div>

      {/* 登録済み日程を一覧表示 */}
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-2 text-[#004CA0]">登録日程一覧</h2>
        <table className="w-full border border-gray-500 text-center">
          <thead>
            <tr className="bg-[#004CA0] text-white">
              <th className="p-2">タイトル</th>
              <th className="p-2">開始日</th>
              <th className="p-2">終了日</th>
              <th className="p-2">時間帯</th>
              <th className="p-2">回答</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s) => (
              <tr key={s.id} className="border-t border-gray-600">
                <td className="p-2">{s.title}</td>
                <td className="p-2">{s.start_date}</td>
                <td className="p-2">{s.end_date}</td>
                <td className="p-2">{s.timeslot}</td>
                <td className="p-2">
                  <select
                    value={responses[s.id] || ""}
                    onChange={(e) =>
                      setResponses({ ...responses, [s.id]: e.target.value })
                    }
                    className="p-1 rounded text-black"
                  >
                    <option value="">選択</option>
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
      <div className="mt-6">
        <button
          onClick={saveResponse}
          className="bg-[#FDB9C8] text-black px-4 py-2 rounded-lg shadow hover:bg-pink-400"
        >
          保存する
        </button>
      </div>
    </div>
  );
}
