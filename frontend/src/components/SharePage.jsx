import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function SharePage() {
  const { linkid } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [responses, setResponses] = useState([]);
  const [username, setUsername] = useState("");
  const [answers, setAnswers] = useState({});
  const [message, setMessage] = useState("");

  const fetchData = async () => {
    try {
      const res = await axios.get(`/api/schedule/${linkid}`);
      setSchedule(res.data.schedules[0]);
      setResponses(res.data.responses);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAnswerChange = (date, value) => {
    setAnswers((prev) => ({ ...prev, [date]: value }));
  };

  const handleSave = async () => {
    try {
      await axios.post(`/api/share/${linkid}/response`, {
        username,
        answers,
      });
      setMessage("✅ 回答を保存しました！");
      fetchData();
    } catch (err) {
      console.error(err);
      setMessage("❌ 保存に失敗しました");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* バナー */}
      <header className="w-full bg-black/40 backdrop-blur-md shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-white drop-shadow">
          MilkPOP Calendar
        </h1>
        <nav className="flex gap-4">
          <Link to="/personal" className="text-white hover:text-[#FDB9C8] transition">
            個人スケジュール
          </Link>
          <Link to="/link" className="text-white hover:text-[#FDB9C8] transition">
            共有スケジュール
          </Link>
        </nav>
      </header>

      {/* メイン */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="backdrop-blur-lg bg-white/20 border border-white/30 
                        rounded-2xl shadow-2xl p-8 w-full max-w-3xl text-black">
          {schedule ? (
            <>
              <h2 className="text-2xl font-bold mb-6 text-center text-white drop-shadow">
                📅 {schedule.title}
              </h2>

              {/* 名前入力 */}
              <label className="block mb-2 font-bold text-white">名前</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 rounded-lg mb-4 bg-white/60 border border-gray-300"
              />

              {/* 回答テーブル */}
              <table className="w-full text-center bg-white/60 rounded-lg overflow-hidden shadow-md">
                <thead className="bg-[#004CA0]/70 text-white">
                  <tr>
                    <th className="p-2">日付</th>
                    <th className="p-2">回答</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.dates.map((d, i) => (
                    <tr key={i} className="border-b border-gray-300">
                      <td className="p-2">{d}</td>
                      <td className="p-2">
                        <select
                          value={answers[d] || ""}
                          onChange={(e) => handleAnswerChange(d, e.target.value)}
                          className="p-1 rounded-lg border border-gray-400"
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

              {/* 保存ボタン */}
              <button
                onClick={handleSave}
                className="mt-6 w-full py-3 rounded-2xl font-bold shadow-md 
                           bg-gradient-to-r from-[#FDB9C8] to-[#004CA0] text-white 
                           hover:opacity-90 transition"
              >
                💾 保存する
              </button>

              {/* 既存の回答一覧 */}
              <h3 className="mt-8 mb-2 text-lg font-bold text-white">📊 回答一覧</h3>
              <table className="w-full text-center bg-white/60 rounded-lg overflow-hidden shadow-md">
                <thead className="bg-[#FDB9C8]/70 text-black">
                  <tr>
                    <th className="p-2">名前</th>
                    {schedule.dates.map((d, i) => (
                      <th key={i} className="p-2">{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {responses.map((r, idx) => (
                    <tr key={idx} className="border-b border-gray-300">
                      <td className="p-2">{r.username}</td>
                      {schedule.dates.map((d, i) => (
                        <td key={i} className="p-2">
                          {r.answers[d] || "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <p className="text-white">📡 読み込み中...</p>
          )}

          {message && (
            <p className="mt-4 text-center text-white font-semibold">{message}</p>
          )}
        </div>
      </main>
    </div>
  );
}
