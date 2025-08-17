import React, { useState } from "react";

export default function PersonalSchedule() {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");

  const addEvent = () => {
    setEvents([...events, { title, memo }]);
    setTitle("");
    setMemo("");
  };

  return (
    <div className="backdrop-blur-lg bg-white/40 rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">👤 個人スケジュール</h2>
      <input placeholder="予定タイトル" value={title} onChange={e=>setTitle(e.target.value)} className="border rounded p-2 mr-2"/>
      <input placeholder="メモ" value={memo} onChange={e=>setMemo(e.target.value)} className="border rounded p-2 mr-2"/>
      <button onClick={addEvent} className="px-3 py-2 bg-blue-500 text-white rounded">追加</button>

      <ul className="mt-4">
        {events.map((ev,i)=>(
          <li key={i} className="p-2 border-b">{ev.title} - {ev.memo}</li>
        ))}
      </ul>
    </div>
  );
}
