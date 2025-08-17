import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function SharedPage() {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [timeType, setTimeType] = useState("allday");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [linkCopied, setLinkCopied] = useState(false);

  const handleAddEvent = async () => {
    await axios.post(`/api/shared/${id}/events`, { title, timeType, startTime, endTime });
    setTitle("");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
  };

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h2>共有スケジュール</h2>
      <p>リンク: <a href={window.location.href} target="_blank" rel="noreferrer">{window.location.href}</a>
        <button onClick={copyLink} style={{ marginLeft: "10px" }}>コピー</button>
        {linkCopied && <span style={{ marginLeft: "10px", color: "#FDB9C8" }}>✅ コピーしました</span>}
      </p>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="タイトルを入力" style={{ padding: "8px", width: "100%", margin: "10px 0" }} />
      <div>
        <label><input type="radio" checked={timeType==="allday"} onChange={()=>setTimeType("allday")} />全日</label>
        <label><input type="radio" checked={timeType==="day"} onChange={()=>setTimeType("day")} />昼</label>
        <label><input type="radio" checked={timeType==="night"} onChange={()=>setTimeType("night")} />夜</label>
        <label><input type="radio" checked={timeType==="range"} onChange={()=>setTimeType("range")} />時間指定</label>
      </div>
      {timeType==="range" && (
        <div>
          <input type="time" value={startTime} onChange={(e)=>setStartTime(e.target.value)} />
          〜
          <input type="time" value={endTime} onChange={(e)=>setEndTime(e.target.value)} />
        </div>
      )}
      <button onClick={handleAddEvent} style={{ marginTop: "10px", padding: "10px", backgroundColor: "#004CA0", color: "white" }}>追加</button>
    </div>
  );
}
