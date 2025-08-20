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
    const res = await axios.get(`/api/schedule/${linkid}`);
    setSchedule(res.data.schedules[0]);
    setResponses(res.data.responses);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 回答更新
  const handleAnswerChange = (date, value) => {
    setAnswers((prev) => ({ ...prev, [date]: value }));
  };

  // 保存処理
  const handleSave = async () => {
    await axios.post(`/api/share/${linkid}/response`, {
      username,
      answers,
    });
    fetchData();
  };

  if (!schedule) {
    return <p className="text-center text-gray-400">読み込み中...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-[#FDB9C8] mb-6">共有ページ</h1>

      {/* スケジュール情報 */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold text-[#FDB9C8] mb-3">{schedule.title}</h2>
        <p className="text-gray-400">登録された日程候補に対して出欠を選択してください。</p>
      </div>

      {/* ユーザー名入力 */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6 mb-6">
        <label className="block text-[#FDB9C8] mb-2">お名前</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 rounded-xl border border-gray-600 bg-black text-white focus:ring-2 focus:ring-[#FDB9C8]"
        />
      </div>

      {/* 日程カード */}
      <div className="grid gap-6">
        {schedule.dates.map((date, idx) => (
          <div
            key={idx}
            className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-xl font-semibold text-[#FDB9C8] mb-3">
              {new Date(date).toLocaleDateString("ja-JP")}
            </h3>

            {/* 時間帯選択 */}
            <div className="mb-3">
              <label className="block text-gray-300 mb-1">時間帯</label>
              <select
                onChange={(e) => handleAnswerChange(date, e.target.value)}
                value={answers[date] || ""}
                className="w-full p-3 rounded-xl border border-gray-600 bg-black text-white focus:ring-2 focus:ring-[#FDB9C8]"
              >
                <option value="">選択してください</option>
                <option value="〇">〇 参加できる</option>
                <option value="✖">✖ 参加できない</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* 保存ボタン */}
      <button
        onClick={handleSave}
        className="mt-6 w-full bg-[#004CA0] hover:bg-[#FDB9C8] text-white font-bold py-3 px-6 rounded-xl transition"
      >
        保存
      </button>

      {/* 回答一覧 */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold text-[#FDB9C8] mb-4">回答一覧</h2>
        <div className="grid gap-6">
          {responses.map((res, idx) => (
            <div
              key={idx}
              className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-xl font-semibold text-[#FDB9C8] mb-2">
                {res.username}
              </h3>
              <div className="text-gray-400">
                {Object.entries(res.answers).map(([d, a]) => (
                  <p key={d}>
                    {new Date(d).toLocaleDateString("ja-JP")} → {a}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
