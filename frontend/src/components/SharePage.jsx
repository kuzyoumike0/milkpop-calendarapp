import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function SharePage() {
  const { id } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [userName, setUserName] = useState("");
  const [responses, setResponses] = useState({});

  useEffect(() => {
    fetch(`https://your-railway-app-url/api/schedule/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setSchedule(data);
        const initialResponses = {};
        (data.dates || []).forEach((d) => (initialResponses[d] = "未回答"));
        setResponses(initialResponses);
      });
  }, [id]);

  const handleChange = (date, value) => {
    setResponses((prev) => ({ ...prev, [date]: value }));
  };

  const handleSave = async () => {
    await fetch(`https://your-railway-app-url/api/schedule/${id}/response`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: userName, responses }),
    });

    // 即反映
    fetch(`https://your-railway-app-url/api/schedule/${id}`)
      .then((res) => res.json())
      .then((data) => setSchedule(data));
  };

  if (!schedule) return <p>読み込み中...</p>;

  const allDates = (schedule.dates || []).sort();

  // ==== 集計処理 ====
  const counts = {};
  allDates.forEach((d) => {
    counts[d] = { "〇": 0, "△": 0, "✖": 0, "未回答": 0 };
  });
  if (schedule.responses) {
    schedule.responses.forEach((r) => {
      allDates.forEach((d) => {
        const v = r.responses[d] || "未回答";
        if (counts[d][v] !== undefined) {
          counts[d][v] += 1;
        }
      });
    });
  }

  return (
    <div className="p-6 text-white">
      <h2 className="text-xl font-bold mb-4">{schedule.title}</h2>

      {/* ユーザ名入力 */}
      <input
        type="text"
        placeholder="名前を入力（ログイン時は自動）"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        className="px-2 py-1 rounded text-black mb-4"
      />

      {/* 回答用プルダウン */}
      <div className="space-y-2 mb-4">
        {allDates.map((d) => (
          <div
            key={d}
            className="flex justify-between items-center bg-black bg-opacity-40 p-2 rounded"
          >
            <span>{d}</span>
            <select
              value={responses[d]}
              onChange={(e) => handleChange(d, e.target.value)}
              className="text-black px-2 py-1 rounded"
            >
              <option value="未回答">未回答</option>
              <option value="〇">〇</option>
              <option value="△">△</option>
              <option value="✖">✖</option>
            </select>
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        className="mt-2 mb-6 px-4 py-2 rounded bg-pink-400 text-black font-bold"
      >
        保存
      </button>

      {/* ==== 回答一覧テーブル ==== */}
      <h3 className="text-lg font-semibold mb-2">回答一覧</h3>
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full border border-white text-sm text-center">
          <thead>
            <tr className="bg-black bg-opacity-60">
              <th className="border px-2 py-1">ユーザー</th>
              {allDates.map((d) => (
                <th key={d} className="border px-2 py-1">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schedule.responses &&
              schedule.responses.map((r, idx) => (
                <tr key={idx} className="bg-black bg-opacity-30">
                  <td className="border px-2 py-1">{r.user}</td>
                  {allDates.map((d) => (
                    <td key={d} className="border px-2 py-1">
                      {r.responses[d] || "未回答"}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* ==== 集計表示 ==== */}
      <h3 className="text-lg font-semibold mb-2">日程ごとの集計</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-white text-sm text-center">
          <thead>
            <tr className="bg-black bg-opacity-60">
              <th className="border px-2 py-1">日程</th>
              <th className="border px-2 py-1">〇</th>
              <th className="border px-2 py-1">△</th>
              <th className="border px-2 py-1">✖</th>
              <th className="border px-2 py-1">未回答</th>
            </tr>
          </thead>
          <tbody>
            {allDates.map((d) => (
              <tr key={d} className="bg-black bg-opacity-30">
                <td className="border px-2 py-1">{d}</td>
                <td className="border px-2 py-1">{counts[d]["〇"]}</td>
                <td className="border px-2 py-1">{counts[d]["△"]}</td>
                <td className="border px-2 py-1">{counts[d]["✖"]}</td>
                <td className="border px-2 py-1">{counts[d]["未回答"]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
