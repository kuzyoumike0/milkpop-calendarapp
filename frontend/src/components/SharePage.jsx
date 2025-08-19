import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function SharePage() {
  const { linkid } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [username, setUsername] = useState("");
  const [responses, setResponses] = useState({});

  useEffect(() => {
    axios.get(`/api/share/${linkid}`).then(res => {
      // 日付順にソート
      const sorted = res.data.sort((a, b) =>
        new Date(a.start_date) - new Date(b.start_date)
      );
      setSchedules(sorted);
    });
  }, [linkid]);

  const handleSave = async (id) => {
    if (!username) {
      alert("名前を入力してください");
      return;
    }
    await axios.post("/api/response", {
      schedule_id: id,
      username,
      response: responses[id] || "✖"
    });
    alert("保存しました！");
  };

  return (
    <div className="max-w-3xl mx-auto bg-[#111] p-6 rounded-2xl shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-[#FDB9C8]">共有スケジュール</h2>

      <input
        className="w-full p-2 rounded text-black"
        placeholder="あなたの名前を入力"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />

      <div className="space-y-4">
        {schedules.map(s => (
          <div key={s.id} className="bg-[#222] p-4 rounded-xl shadow-md">
            <div className="font-bold text-lg text-[#FDB9C8]">{s.title}</div>
            <div className="text-sm text-gray-300">
              {s.start_date} ~ {s.end_date} [{s.timeslot}]
            </div>
            <div className="mt-2">
              <select
                className="p-2 text-black rounded"
                value={responses[s.id] || ""}
                onChange={e => setResponses({ ...responses, [s.id]: e.target.value })}
              >
                <option value="">選択してください</option>
                <option value="〇">〇</option>
                <option value="✖">✖</option>
              </select>
              <button
                onClick={() => handleSave(s.id)}
                className="ml-3 bg-[#004CA0] hover:bg-[#FDB9C8] text-white font-bold py-1 px-4 rounded transition"
              >
                保存
              </button>
            </div>
          </div>
        ))}
      </div>

      {schedules.length === 0 && (
        <p className="text-gray-400">まだ共有された日程がありません。</p>
      )}
    </div>
  );
}
