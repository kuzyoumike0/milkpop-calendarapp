import React, { useState } from "react";

export default function Personal(){
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [date, setDate] = useState("");

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold">個人スケジュール</h2>
      <input className="glass w-full p-3" placeholder="タイトル" value={title} onChange={e=>setTitle(e.target.value)}/>
      <textarea className="glass w-full p-3" placeholder="メモ" value={memo} onChange={e=>setMemo(e.target.value)} />
      <input className="glass p-3" type="date" value={date} onChange={e=>setDate(e.target.value)} />
      <button className="btn-primary">追加（ダミー）</button>
    </div>
  );
}
