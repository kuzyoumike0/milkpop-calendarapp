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
    const res = await axios.get(`/api/schedule/${linkid}`);
    setSchedule(res.data.schedules[0]);
    setResponses(res.data.responses);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAnswerChange = (date, value) => {
    setAnswers((prev) => ({ ...prev, [date]: value }));
  };

  const handleSave = async () => {
    await axios.post(`/api/share/${linkid}/response`, {
      username,
      answers,
    });
    fetchData();
  };

  if (!schedule) return <p className="text-center text-gray-400">読み込み中...</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#FDB9C8] mb-6">共有ページ</h1>

      {/* スケジュールカード */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold text-[#FDB9C8] mb-2">{schedule.title}</h2>
        <p className="text-gray-400">選択された日程: {JSON.stringify(schedule.dates)}</p>
        <p className="text-gray-400">時間帯: {schedule.timeslot}</p>
        <p className="text-gray-400">
          {schedule.starttime} - {schedule.endtime}
        </p>
      </div>

      {/* 回答入力 */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#FDB9C8] mb-3">出欠を登録</h2>
        <input
          type="text"
          placeholder="名前を入力"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 mb-4 rounded-xl border border-gray-600 bg-black text-white"
        />
        {schedule.dates.map((d) => (
          <div key={d} className="mb-3">
            <label className="block text-gray-300 mb-1">{d}</label>
            <select
              value={answers[d] || ""}
              onChange={(e) => handleAnswerChange(d, e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-600 bg-black text-white"
            >
              <option value="">選択してください</option>
              <option value="〇">〇</option>
              <option value="✖">✖</option>
            </select>
          </div>
        ))}
        <button
          onClick={handleSave}
          className="w-full bg-[#004CA0] hover:bg-[#FDB9C8] text-white font-bold py-3 px-6 rounded-xl transition"
        >
          保存
        </button>
      </div>

      {/* 回答一覧 */}
      <div className="space-y-4">
        {responses.map((r, i) => (
          <div
            key={i}
            className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-[#FDB9C8] mb-2">
              {r.username}
            </h3>
            <p className="text-gray-400">{JSON.stringify(r.answers)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
