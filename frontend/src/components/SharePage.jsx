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

  return (
    <div className="p-6 text-white">
      <h2 className="text-xl font-bold mb-4">{schedule.title}</h2>

      <input
        type="text"
        placeholder="名前を入力（ログイン時は自動）"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        className="px-2 py-1 rounded text-black mb-4"
      />

      <div className="space-y-2">
        {(schedule.dates || []).sort().map((d) => (
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
        className="mt-4 px-4 py-2 rounded bg-pink-400 text-black font-bold"
      >
        保存
      </button>
    </div>
  );
}
