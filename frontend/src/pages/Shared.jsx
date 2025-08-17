import React, { useState } from "react";
import { Link } from "react-router-dom";

function randomId(){
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2,10);
}

export default function Shared(){
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState("range"); // range | multi
  const [selected, setSelected] = useState([]);
  const [range, setRange] = useState({ from: "", to: "" });
  const [link, setLink] = useState("");

  const emitLink = () => {
    const id = randomId();
    setLink(`/share/${id}`);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">共有カレンダー</h2>
      <input className="glass w-full p-3" placeholder="タイトル" value={title} onChange={e=>setTitle(e.target.value)} />

      <div className="flex gap-6 items-center">
        <label><input type="radio" checked={mode==="range"} onChange={()=>setMode("range")} /> 範囲選択</label>
        <label><input type="radio" checked={mode==="multi"} onChange={()=>setMode("multi")} /> 複数選択</label>
      </div>

      {mode==="range" ? (
        <div className="flex gap-3">
          <input className="glass p-3" type="date" value={range.from} onChange={e=>setRange({...range, from: e.target.value})} />
          <span className="self-center">〜</span>
          <input className="glass p-3" type="date" value={range.to} onChange={e=>setRange({...range, to: e.target.value})} />
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-sm opacity-80">複数日を追加:</div>
          <div className="flex gap-2">
            <input className="glass p-3" type="date" onChange={e=>setSelected(Array.from(new Set([...selected, e.target.value])))} />
            <button className="btn-primary" onClick={()=>setSelected([])}>クリア</button>
          </div>
          <div className="text-sm">選択: {selected.join(", ") || "なし"}</div>
        </div>
      )}

      <button className="btn-primary" onClick={emitLink}>共有リンクを発行</button>

      {link && (
        <div className="space-y-2">
          <div className="text-sm">発行されたURL（毎回新規）:</div>
          <Link to={link} className="text-brandBlue underline">{window.location.origin}{link}</Link>
        </div>
      )}
    </div>
  );
}
