import React, { useState } from "react";

export default function SharedLink() {
  const [username, setUsername] = useState("");
  const [memo, setMemo] = useState("");
  const [timeSlot, setTimeSlot] = useState("全日");

  return (
    <div className="backdrop-blur-lg bg-white/40 rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">🔗 共有リンク</h2>
      <input placeholder="ユーザー名" value={username} onChange={e=>setUsername(e.target.value)} className="border rounded p-2 mr-2"/>
      <select value={timeSlot} onChange={e=>setTimeSlot(e.target.value)} className="border rounded p-2 mr-2">
        <option>全日</option>
        <option>昼</option>
        <option>夜</option>
      </select>
      <input placeholder="メモ" value={memo} onChange={e=>setMemo(e.target.value)} className="border rounded p-2 mr-2"/>
      <button className="px-3 py-2 bg-green-500 text-white rounded">追加</button>
    </div>
  );
}
