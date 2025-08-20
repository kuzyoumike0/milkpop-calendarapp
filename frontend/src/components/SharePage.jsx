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
      if (res.data.schedules.length > 0) {
        // 日付順ソート
        const sorted = [...res.data.schedules[0].dates].sort();
        setSchedule({ ...res.data.schedules[0], dates: sorted });
      }
      setResponses(res.data.responses);
    } catch (err) {
      console.error("データ取得エラー:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 選択変更
  const handleAnswerChange = (date, value) => {
    setAnswers((prev) => ({ ...prev, [date]: value }));
  };

  // 保存
  const handleSave = async () => {
    try {
      await axios.post(`/api/share/${linkid}/response`, {
        username,
        answers,
      });
      setUsername("");
      setAnswers({});
      await fetchData(); // 即時反映
    } catch (err) {
      console.error("保存エラー:", err);
      alert("保存に失敗しました");
    }
  };

  return (
    <div className="flex flex-col items-center text-center">
      <h1 className="text-3xl font-bold text-white mt-6 mb-6">
        日程共有ページ
      </h1>

      {/* スケジュール情報 */}
      {schedule && (
        <div className="backdrop-blur-md bg-white/20 border border-white/30 shadow-lg rounded-2xl p-6 w-full max-w-4xl">
          <h2 className="text-2xl font-semibold text-[#FDB9C8] mb-4">
            {schedule.title}
          </h2>

          {/* ユーザー名入力 */}
          <input
            type="text"
            placeholder="あなたの名前を入力"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 mb-4"
          />

          {/* 回答フォーム（テーブル形式） */}
          <table className="w-full border-collapse mb-4">
            <thead>
              <tr className="bg-[#004CA0]/80 text-white">
                <th className="px-4 py-2">日付</th>
                <th className="px-4 py-2">回答</th>
              </tr>
            </thead>
            <tbody>
              {schedule.dates.map((date) => (
                <tr
                  key={date}
                  className="border-b border-white/30 hover:bg-white/10"
                >
                  <td className="px-4 py-2 text-white">{date}</td>
                  <td className="px-4 py-2">
                    <select
                      value={answers[date] || ""}
                      onChange={(e) => handleAnswerChange(date, e.target.value)}
                      className="p-2 rounded-lg border border-gray-300"
                    >
                      <option value="">未選択</option>
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
            className="px-6 py-3 rounded-xl bg-[#FDB9C8] text-black font-bold shadow-md hover:bg-[#e89cac] transition"
          >
            保存
          </button>
        </div>
      )}

      {/* 回答一覧 */}
      {responses.length > 0 && (
        <div className="backdrop-blur-md bg-white/10 border border-white/30 shadow-lg rounded-2xl p-6 w-full max-w-4xl mt-6 overflow-x-auto">
          <h3 className="text-xl font-semibold text-[#004CA0] mb-4">
            回答一覧
          </h3>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#FDB9C8]/80 text-black">
                <th className="px-4 py-2">ユーザー</th>
                {schedule?.dates.map((date) => (
                  <th key={date} className="px-4 py-2">
                    {date}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {responses.map((res, idx) => (
                <tr
                  key={idx}
                  className="border-b border-white/30 hover:bg-white/10"
                >
                  <td className="px-4 py-2 text-white">{res.username}</td>
                  {schedule?.dates.map((date) => (
                    <td key={date} className="px-4 py-2 text-white">
                      {res.answers[date] || "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
