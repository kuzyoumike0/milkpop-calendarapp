import React, { useState } from "react";

export default function SharedSetup() {
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");

  const generateLink = () => {
    const id = Math.random().toString(36).substring(2, 8);
    setLink(`${window.location.origin}/link/${id}`);
  };

  return (
    <div className="backdrop-blur-lg bg-white/40 rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">⚙️ 共有設定</h2>
      <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="border rounded p-2 mr-2"/>
      <input type="text" placeholder="タイトル" value={title} onChange={e=>setTitle(e.target.value)} className="border rounded p-2 mr-2"/>
      <button onClick={generateLink} className="px-3 py-2 bg-blue-500 text-white rounded">リンク生成</button>

      {link && (
        <div className="mt-4">
          <p>✅ 共有リンク:</p>
          <a href={link} className="text-blue-600 underline">{link}</a>
        </div>
      )}
    </div>
  );
}
