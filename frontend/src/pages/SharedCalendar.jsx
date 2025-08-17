import React, { useState } from "react";

export default function SharedCalendar() {
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");

  const createLink = async () => {
    const res = await fetch("/api/shared-link", { method: "POST" });
    const data = await res.json();
    setLink(data.link);
  };

  return (
    <div>
      <h2 className="text-xl mb-4">共有カレンダー</h2>
      <input
        className="border p-2 mb-2 block"
        placeholder="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button
        className="bg-green-500 text-white px-4 py-2 rounded"
        onClick={createLink}
      >
        共有リンク発行
      </button>
      {link && <p className="mt-4">🔗 共有リンク: {link}</p>}
    </div>
  );
}
