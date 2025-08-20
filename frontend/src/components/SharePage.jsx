import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function SharePage() {
  const { linkid } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [responses, setResponses] = useState([]);
  const [username, setUsername] = useState("");
  const [answers, setAnswers] = useState({});
  const [saved, setSaved] = useState(false);

  const fetchData = async () => {
    try {
      const res = await axios.get(`/api/schedule/${linkid}`);
      setSchedule(res.data.schedules[0]);
      setResponses(res.data.responses);
    } catch (err) {
      console.error("共有スケジュール取得失敗:", err);
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
      setSaved(true);
      fetchData(); // 即時反映
    } catch (err) {
      console.error("保存失敗:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--brand-black)] flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-4xl card">
        <h2 className="card-title text-center">共有スケジュール</h2>

        {!schedule ? (
          <p className="text-center text-gray-400">読み込み中...</p>
        ) : (
          <>
            {/* スケジュールタイトル */}
            <div className="mb-6 text-center">
              <h3 className="text-[color:var(--brand-pink)] text-xl font-bold">
                {schedule.title}
              </h3>
              <p className="text-gray-400 mt-2">
                選択モード: {schedule.range_mode === "range" ? "範囲選択" : "複数選択"}
              </p>
            </div>

            {/* カレンダー表示 */}
            <div className="mb-6 flex justify-center">
              <Calendar
                value={
                  schedule.range_mode === "range"
                    ? [new Date(schedule.start_date), new Date(schedule.end_date)]
                    : schedule.dates.map((d) => new Date(d))
                }
                selectRange={schedule.range_mode === "range"}
                tileClassName={({ date }) => {
                  const dateStr = date.toISOString().split("T")[0];
                  return schedule.dates.includes(dateStr)
                    ? "bg-[color:var(--brand-blue)] text-white rounded-lg"
                    : null;
                }}
                className="rounded-xl"
              />
            </div>

            {/* ユーザー名 */}
            <div className="mb-6">
              <label className="block text-gray-300 mb-2">名前</label>
              <input
                type="text"
                className="w-full p-2 rounded bg-neutral-800 text-white focus:ring-2 focus:ring-[color:var(--brand-pink)]"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="あなたの名前を入力"
              />
            </div>

            {/* 〇✖ 選択 */}
            <div className="mb-6 space-y-4">
              {schedule.dates.map((d) => (
                <div
                  key={d}
                  className="p-4 bg-neutral-800 rounded-lg shadow flex justify-between items-center"
                >
                  <span className="text-gray-200">{d}</span>
                  <select
                    className="ml-4 p-2 rounded bg-neutral-700 text-white"
                    value={answers[d] || ""}
                    onChange={(e) => handleAnswerChange(d, e.target.value)}
                  >
                    <option value="">選択してください</option>
                    <option value="〇">〇</option>
                    <option value="✖">✖</option>
                  </select>
                </div>
              ))}
            </div>

            {/* 保存ボタン */}
            <div className="text-center">
              <button onClick={handleSave} className="btn">
                保存
              </button>
            </div>
            {saved && (
              <p className="text-center text-[color:var(--brand-pink)] mt-4">
                保存しました！
              </p>
            )}

            {/* 回答一覧 */}
            <div className="mt-8">
              <h3 className="text-[color:var(--brand-pink)] text-lg font-semibold mb-4">
                回答一覧
              </h3>
              <div className="grid gap-4">
                {responses.map((res, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-neutral-900 rounded-lg shadow"
                  >
                    <h4 className="text-[color:var(--brand-blue)] font-bold">
                      {res.username}
                    </h4>
                    <ul className="text-gray-300 mt-2 space-y-1">
                      {Object.entries(res.answers).map(([date, ans]) => (
                        <li key={date}>
                          {date}:{" "}
                          <span
                            className={
                              ans === "〇" ? "text-green-400" : "text-red-400"
                            }
                          >
                            {ans}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
