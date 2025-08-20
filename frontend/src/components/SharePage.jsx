import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function SharePage() {
  const { linkid } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [username, setUsername] = useState("");
  const [selections, setSelections] = useState([]);

  useEffect(() => {
    axios.get(`/api/share/${linkid}`).then((res) => setSchedules(res.data));
  }, [linkid]);

  const toggleSelect = (date, timeslot) => {
    const key = `${date}-${timeslot}`;
    if (selections.find((s) => `${s.date}-${s.timeslot}` === key)) {
      setSelections(selections.filter((s) => `${s.date}-${s.timeslot}` !== key));
    } else {
      setSelections([...selections, { date, timeslot, status: "○" }]);
    }
  };

  const handleSubmit = async () => {
    await axios.post(`/api/share/${linkid}`, { username, selections });
    alert("登録しました！");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-4">共有スケジュール</h1>

      <input
        className="w-full p-2 mb-3 bg-gray-800 rounded"
        placeholder="ユーザー名"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <ul className="space-y-3">
        {schedules.map((s, idx) => (
          <li key={idx} className="p-3 bg-gray-800 rounded-lg">
            <div className="flex justify-between items-center">
              <span>
                <strong>{s.title}</strong> ({s.timeslot}) {s.date}
              </span>
              <button
                onClick={() => toggleSelect(s.date, s.timeslot)}
                className={`px-3 py-1 rounded ${
                  selections.find((sel) => sel.date === s.date && sel.timeslot === s.timeslot)
                    ? "bg-blue-600"
                    : "bg-gray-600"
                }`}
              >
                ○/✕
              </button>
            </div>
          </li>
        ))}
      </ul>

      <button
        onClick={handleSubmit}
        className="mt-6 w-full py-3 bg-blue-600 rounded-lg hover:bg-blue-500"
      >
        登録する
      </button>
    </div>
  );
}
