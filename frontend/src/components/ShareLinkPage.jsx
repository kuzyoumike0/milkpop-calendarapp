import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function ShareLinkPage() {
  const { linkid } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [responses, setResponses] = useState({});
  const [username, setUsername] = useState("");
  const [linkTitle, setLinkTitle] = useState("");

  // 即時反映: linkidごとのスケジュール取得
  const fetchSchedules = async () => {
    try {
      const res = await axios.get(`/api/schedules?linkid=${linkid}`);
      setSchedules(res.data);
      if (res.data.length > 0) {
        setLinkTitle(res.data[0].link_title || "");
      }
    } catch (err) {
      console.error("取得エラー:", err);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [linkid]);

  // 出欠選択変更
  const handleChange = (scheduleId, value) => {
    setResponses((prev) => ({ ...prev, [scheduleId]: value }));
  };

  // 保存処理
  const handleSave = async () => {
    if (!username) {
      alert("名前を入力してください");
      return;
    }
    try {
      const res = await axios.post("/api/share-responses", {
        username,
        responses,
      });
      setSchedules(res.data.filter((s) => s.linkid === linkid));
      setResponses({});
    } catch (err) {
      console.error("保存エラー:", err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* バナー */}
      <header className="bg-[#004CA0] text-[#FDB9C8] text-3xl font-bold p-4 rounded-2xl shadow-lg flex justify-between">
        <span>MilkPOP Calendar</span>
        <nav className="space-x-4">
          <a href="/" className="hover:underline">トップ</a>
          <a href="/link" className="hover:underline">日程登録</a>
          <a href="/personal" className="hover:underline">個人スケジュール</a>
        </nav>
      </header>

      {/* 共有リンクタイトル */}
      <div className="bg-[#1a1a1a] mt-6 p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl mb-4">
          共有リンクページ {linkTitle && `: ${linkTitle}`}
        </h2>

        {/* ユーザー名入力 */}
        <input
          className="w-full p-2 mb-3 rounded bg-gray-800 text-white"
          type="text"
          placeholder="あなたの名前"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        {/* スケジュール一覧 */}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#004CA0] text-[#FDB9C8]">
              <th className="p-2">タイトル</th>
              <th className="p-2">日付</th>
              <th className="p-2">時間帯</th>
              <th className="p-2">可否入力</th>
              <th className="p-2">回答一覧</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s) => (
              <tr key={s.id} className="border-b border-gray-700 align-top">
                <td className="p-2">{s.title}</td>
                <td className="p-2">{s.date}</td>
                <td className="p-2">{s.timeslot}</td>
                <td className="p-2">
                  <select
                    className="bg-gray-800 text-white p-1 rounded"
                    value={responses[s.id] || ""}
                    onChange={(e) => handleChange(s.id, e.target.value)}
                  >
                    <option value="">選択</option>
                    <option value="◯">◯</option>
                    <option value="✕">✕</option>
                  </select>
                </td>
                <td className="p-2">
                  {s.responses && s.responses.length > 0 ? (
                    <ul className="list-disc list-inside">
                      {s.responses.map((r, i) => (
                        <li key={i}>
                          <span className="font-bold">{r.username}</span>: {r.response}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-gray-500">まだ回答なし</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          onClick={handleSave}
          className="mt-4 w-full bg-[#FDB9C8] text-black font-bold py-2 px-4 rounded-2xl shadow hover:bg-pink-400"
        >
          保存
        </button>
      </div>
    </div>
  );
}
