import React, { useState } from "react";
import axios from "axios";

export default function LinkPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [timeslot, setTimeslot] = useState("終日");
  const [rangeMode, setRangeMode] = useState("範囲選択");
  const [shareUrl, setShareUrl] = useState("");

  const handleSubmit = async () => {
    const res = await axios.post("/api/schedule", {
      title,
      memo,
      start_date: start,
      end_date: end,
      timeslot,
      range_mode: rangeMode,
    });
    setShareUrl(window.location.origin + res.data.url);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl">日程登録</h2>
      <input className="text-black w-full p-2" placeholder="タイトル" value={title} onChange={e=>setTitle(e.target.value)} />
      <textarea className="text-black w-full p-2" placeholder="メモ" value={memo} onChange={e=>setMemo(e.target.value)} />
      <div>
        開始日: <input type="date" value={start} onChange={e=>setStart(e.target.value)} className="text-black" />
      </div>
      <div>
        終了日: <input type="date" value={end} onChange={e=>setEnd(e.target.value)} className="text-black" />
      </div>
      <div>
        <label><input type="radio" checked={rangeMode==="範囲選択"} onChange={()=>setRangeMode("範囲選択")} />範囲選択</label>
        <label className="ml-4"><input type="radio" checked={rangeMode==="複数選択"} onChange={()=>setRangeMode("複数選択")} />複数選択</label>
      </div>
      <select value={timeslot} onChange={e=>setTimeslot(e.target.value)} className="text-black p-2">
        <option>終日</option>
        <option>昼</option>
        <option>夜</option>
        <option>1時から0時</option>
      </select>
      <button onClick={handleSubmit} className="bg-[#FDB9C8] px-4 py-2 rounded">共有リンク発行</button>
      {shareUrl && <div>共有URL: <a href={shareUrl}>{shareUrl}</a></div>}
    </div>
  );
}
