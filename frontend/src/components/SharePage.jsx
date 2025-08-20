import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
      console.error("データ取得失敗:", err);
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
      alert("保存に失敗しました");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {schedule ? (
        <>
          {/* スケジュールタイトル */}
          <h1 className="text-3xl font-bold text-[#FDB9C8] mb-6 text-center">
            {schedule.title}
          </h1>

          {/* ユーザー名入力 */}
          <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6 mb-8">
            <label className="block text-[#FDB9C8] mb-2">名前を入力</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 mb-4 rounded-xl border border-gray-600 bg-black text-white focus:ring-2 focus:ring-[#FDB9C8]"
            />
          </div>

          {/* 日程ごとの回答カード */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            {schedule.dates?.map((d, idx) => (
              <div
                key={idx}
                className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6"
              >
                <h2 className="text-xl font-semibold text-[#FDB9C8] mb-3">
                  {d}
                </h2>
                <select
                  value={answers[d] || ""}
                  onChange={(e) => handleAnswerChange(d, e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-600 bg-black text-white focus:ring-2 focus:ring-[#FDB9C8]"
                >
                  <option value="">未選択</option>
                  <option value="〇">〇</option>
                  <option value="✖">✖</option>
                </select>
              </div>
            ))}
          </div>

          {/* 保存ボタン */}
          <button
            onClick={handleSave}
            className="w-full bg-[#004CA0] hover:bg-[#FDB9C8] text-white font-bold py-3 px-6 rounded-xl transition"
          >
            保存する
          </button>

          {/* 保存済みメッセージ */}
          {saved && (
            <div className="mt-6 p-4 bg-gray-900 border border-gray-700 rounded-xl text-center">
              <p className="text-[#FDB9C8] font-bold">保存しました！</p>
            </div>
          )}

          {/* 全員の回答一覧 */}
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-[#FDB9C8] mb-6">
              回答一覧
            </h2>
            <div className="grid gap-4">
              {responses.map((res, i) => (
                <div
                  key={i}
                  className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6"
                >
                  <h3 className="text-lg font-semibold text-[#FDB9C8] mb-2">
                    {res.username}
                  </h3>
                  <div className="text-gray-400 text-sm whitespace-pre-wrap">
                    {Object.entries(res.answers).map(([date, ans], idx) => (
                      <p key={idx}>
                        {date} :{" "}
                        <span className="font-bold text-white">{ans}</span>
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <p className="text-gray-400 text-center">読み込み中...</p>
      )}
    </div>
  );
}
