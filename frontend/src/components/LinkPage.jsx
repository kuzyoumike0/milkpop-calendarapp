import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import Holidays from "date-holidays";

const hd = new Holidays("JP");

export default function LinkPage() {
  const { linkid } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [username, setUsername] = useState("");
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    axios.get(`/api/share/${linkid}`).then((res) => setSchedules(res.data));
  }, [linkid]);

  const handleSelect = (date, timeslot, status) => {
    setSelected((prev) => {
      const filtered = prev.filter(
        (s) => !(s.date === date && s.timeslot === timeslot)
      );
      return [...filtered, { date, timeslot, status }];
    });
  };

  const handleSubmit = async () => {
    if (!username) {
      alert("名前を入力してください");
      return;
    }
    try {
      await axios.post(`/api/share/${linkid}`, {
        username,
        selections: selected,
      });
      alert("登録しました！");
    } catch (err) {
      console.error("Error saving selections:", err);
      alert("登録に失敗しました");
    }
  };

  return (
    <div className="p-4 text-white">
      <h1 className="text-2xl font-bold mb-4">共有スケジュール</h1>
      <input
        type="text"
        placeholder="名前"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="border p-2 rounded text-black block mb-2"
      />

      <div className="mt-6">
        {schedules.map((s, idx) => (
          <div key={idx} className="mb-4 border p-3 rounded bg-gray-800">
            <p>
              <strong>{s.title}</strong> {s.date} ({s.timeslot})
            </p>
            <div className="space-x-2 mt-2">
              <button
                onClick={() => handleSelect(s.date, s.timeslot, "⭕")}
                className="bg-green-600 px-2 py-1 rounded"
              >
                ⭕
              </button>
              <button
                onClick={() => handleSelect(s.date, s.timeslot, "❌")}
                className="bg-red-600 px-2 py-1 rounded"
              >
                ❌
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="mt-4 bg-blue-600 px-4 py-2 rounded"
      >
        登録
      </button>
    </div>
  );
}
