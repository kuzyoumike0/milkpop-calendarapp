import React, { useState } from "react";

export default function SharedView() {
  const [selected, setSelected] = useState([]);
  const [dateMode, setDateMode] = useState("range");
  const [slotMode, setSlotMode] = useState("simple");
  const [shareUrl, setShareUrl] = useState("");

  return (
    <div className="shared-view">
      <h2>共有カレンダー</h2>

      {/* 日程選択モード */}
      <div>
        <label><input type="radio" value="range" checked={dateMode==="range"} onChange={e=>setDateMode(e.target.value)} /> 範囲選択</label>
        <label><input type="radio" value="multiple" checked={dateMode==="multiple"} onChange={e=>setDateMode(e.target.value)} /> 複数選択</label>
      </div>

      {/* 区分選択 */}
      <div>
        <label><input type="radio" value="simple" checked={slotMode==="simple"} onChange={e=>setSlotMode(e.target.value)} /> 終日/昼/夜</label>
        <label><input type="radio" value="time" checked={slotMode==="time"} onChange={e=>setSlotMode(e.target.value)} /> 時間指定</label>
      </div>

      {slotMode==="simple" ? (
        <select>
          <option value="allday">終日</option>
          <option value="noon">昼</option>
          <option value="night">夜</option>
        </select>
      ) : (
        <select>
          {Array.from({length:24},(_,i)=>(
            <option key={i} value={i}>{i}:00</option>
          ))}
        </select>
      )}

      {/* 共有リンク発行 */}
      <button onClick={()=>{
        const newUrl = window.location.origin + "/share/" + Math.random().toString(36).slice(2,8);
        setShareUrl(newUrl);
        navigator.clipboard.writeText(newUrl);
      }}>共有リンクを発行</button>

      {shareUrl && <div>共有リンク: <a href={shareUrl}>{shareUrl}</a></div>}
    </div>
  );
}
