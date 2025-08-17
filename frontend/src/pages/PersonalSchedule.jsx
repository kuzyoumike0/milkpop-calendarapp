import React, { useState } from "react";

export default function PersonalSchedule() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");

  return (
    <div>
      <h2 className="text-xl mb-4">個人スケジュール</h2>
      <input
        className="border p-2 mb-2 block"
        placeholder="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="border p-2 mb-2 block"
        placeholder="メモ"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
      />
      <button className="bg-blue-500 text-white px-4 py-2 rounded">
        保存
      </button>
    </div>
  );
}
