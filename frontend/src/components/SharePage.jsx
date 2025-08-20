import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function SharePage() {
  const { linkid } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [responses, setResponses] = useState([]);
  const [username, setUsername] = useState("");
  const [answers, setAnswers] = useState({});

  const fetchData = async () => {
    try {
      const res = await axios.get(`/api/schedule/${linkid}`);
      setSchedule(res.data.schedules[0]);
      setResponses(res.data.responses);
    } catch (err) {
      console.error("取得失敗:", err);
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
      fetchData(); // 即反映
    } catch (err) {
      console.error("保存失敗:", err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* バナー */}
      <header className="bg-[#004CA0] text-white text-center py-4 text-2xl font-bold">
        MilkPOP Calendar
      </header>

      <main className="flex flex-col items-center flex-grow py-10 px-4">
        <h2 className="text-2xl font-bold mb-6">共有スケジュール</h2>

        {schedule ? (
          <div className="mb-8 p-4 bg-[#004CA0]/50 rounded-lg w-full max-w-2xl">
            <p className="font-bold text-lg">{schedule.title}</p>
            <p className="text-sm mt-2">時間帯: {schedule.timeslot}</p>
          </div>
        ) : (
          <p>読み込み中...</p>
        )}

        <input
          type="text"
          placeholder="名前を入力"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mb-6 p-2 rounded text-black w-80"
        />

        {/* 予定一覧に対して〇✖選択 */}
        {schedule && (
          <div className="w-full max-w-3xl mb-6">
            <table className="w-full border border-gray-700 rounded-lg overflow-hidden">
              <thead className="bg-[#004CA0]/80">
                <tr>
                  <th className="p-2 border">日付</th>
                  <th className="p-2 border">回答</th>
                </tr>
              </thead>
              <tbody>
                {schedule.dates?.map((date, idx) => (
                  <tr key={idx} className="text-center">
                    <td className="p-2 border">{date}</td>
                    <td className="p-2 border">
                      <select
                        value={answers[date] || ""}
                        onChange={(e) =>
                          handleAnswerChange(date, e.target.value)
                        }
                        className="p-1 rounded text-black"
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
          </div>
        )}

        <button
          onClick={handleSave}
          className="px-6 py-2 bg-[#FDB9C8] text-black rounded-lg font-bold hover:bg-[#004CA0] hover:text-white transition"
        >
          保存
        </button>

        {/* 全員分の回答一覧 */}
        <div className="mt-8 w-full max-w-3xl">
          <h3 className="text-xl font-bold mb-4">回答一覧</h3>
          <table className="w-full border border-gray-700 rounded-lg overflow-hidden">
            <thead className="bg-[#FDB9C8]/80 text-black">
              <tr>
                <th className="p-2 border">ユーザー</th>
                <th className="p-2 border">回答</th>
              </tr>
            </thead>
            <tbody>
              {responses.map((r, idx) => (
                <tr key={idx} className="text-center">
                  <td className="p-2 border">{r.username}</td>
                  <td className="p-2 border">
                    {Object.entries(r.answers).map(([date, ans]) => (
                      <div key={date}>
                        {date}: {ans}
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
