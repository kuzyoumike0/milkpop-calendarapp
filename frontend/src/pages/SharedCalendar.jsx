import React, { useState } from 'react';

export default function SharedCalendar() {
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState("range");

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">共有カレンダー</h2>
      <input className="border p-2 mb-4 w-full" placeholder="タイトル入力" value={title} onChange={(e)=>setTitle(e.target.value)} />
      <div className="mb-4">
        <label><input type="radio" value="range" checked={mode==="range"} onChange={()=>setMode("range")} /> 範囲選択</label>
        <label className="ml-4"><input type="radio" value="multi" checked={mode==="multi"} onChange={()=>setMode("multi")} /> 複数選択</label>
      </div>
      <button className="bg-blue-500 text-white px-4 py-2 rounded">共有リンク発行</button>
    </div>
  );
}
