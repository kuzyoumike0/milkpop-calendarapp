import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function SharePage() {
  const { linkid } = useParams();
  const [username, setUsername] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [answers, setAnswers] = useState({});
  const [responses, setResponses] = useState([]);

  // データ取得
  useEffect(() => {
    axios.get(`/api/schedule/${linkid}`).then((res) => {
      setSchedules(res.data.schedules);
      setResponses(res.data.responses || []);
    });
  }, [linkid]);

  // 保存
  const handleSave = async () => {
    if (!username) {
      alert("名前を入力してください");
      return;
    }
    await axios.post(`/api/schedule/${linkid}/response`, {
      username,
      answers,
    });
    const res = await axios.get(`/api/schedule/${linkid}`);
    setResponses(res.data.responses || []);
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-6 text-[#FDB9C8]">共有ページ</h2>

      {/* 名前入力 */}
      <input
        className="p-2 mb-4 w-full text-black rounded"
        placeholder="名前を入力"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      {/* 回答入力 */}
      <h3 className="text-xl mb-2 text-[#004CA0]">予定に対する回答</h3>
      <table className="w-full border text-center">
        <thead className="bg-[#111] text-[#FDB9C8]">
          <tr>
            <th className="border px-2 py-1">タイトル</th>
            <th className="border px-2 py-1">日付</th>
            <th className="border px-2 py-1">時間帯</th>
            <th className="border px-2 py-1">回答</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((s, idx) => (
            <tr key={idx} className="bg-[#222] text-white">
              <td className="border px-2 py-1">{s.title}</td>
              <td className="border px-2 py-1">{s.dates.join(", ")}</td>
              <td className="border px-2 py-1">{s.timeslot}</td>
              <td className="border px-2 py-1">
                <select
                  className="p-1 text-black rounded"
                  value={answers[s.id] || ""}
                  onChange={(e) =>
                    setAnswers({ ...answers, [s.id]: e.target.value })
                  }
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

      <button onClick={handleSave} className="mt-4 btn-accent">
        保存
      </button>

      {/* 回答一覧 */}
      <h3 className="text-xl mt-8 mb-2 text-[#004CA0]">全員分の一覧</h3>
      <div className="overflow-x-auto">
        <table className="w-full border text-center">
          <thead className="bg-[#111] text-[#FDB9C8]">
            <tr>
              <th className="border px-2 py-1">ユーザー名</th>
              {schedules.map((s, idx) => (
                <th key={idx} className="border px-2 py-1">
                  {s.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {responses.map((r, idx) => (
              <tr key={idx} className="bg-[#222] text-white">
                <td className="border px-2 py-1">{r.username}</td>
                {schedules.map((s, j) => (
                  <td key={j} className="border px-2 py-1">
                    {r.answers[s.id] || "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
