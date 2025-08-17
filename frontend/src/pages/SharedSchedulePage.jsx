import React, { useState } from "react";
import axios from "axios";

export default function SharedSchedulePage() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [timeOption, setTimeOption] = useState("全日");
  const [shareLink, setShareLink] = useState("");

  const handleCreate = async () => {
    const res = await axios.post("/api/shared/create", {
      title, date, time_range: timeOption
    });
    setShareLink(res.data.link);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-primary">共有スケジュール作成</h2>
      <input type="text" value={title} onChange={e=>setTitle(e.target.value)} placeholder="タイトル" className="block mb-2 px-2 py-1 rounded text-black"/>
      <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="block mb-2 px-2 py-1 rounded text-black"/>
      <select value={timeOption} onChange={e=>setTimeOption(e.target.value)} className="block mb-2 px-2 py-1 rounded text-black">
        <option>全日</option>
        <option>昼</option>
        <option>夜</option>
        <option>時間指定</option>
      </select>
      <button onClick={handleCreate} className="px-4 py-2 bg-primary text-dark rounded-lg hover:bg-secondary hover:text-white">共有リンク発行</button>
      {shareLink && <p className="mt-4">共有リンク: <a href={shareLink} className="text-secondary underline">{shareLink}</a></p>}
    </div>
  );
}
