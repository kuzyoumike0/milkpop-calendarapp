import React, { useState } from "react";

export default function SharedPage() {
  const [title, setTitle] = useState("");
  const [timeMode, setTimeMode] = useState("slot");
  const [timeSlot, setTimeSlot] = useState("全日");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("18:00");
  const [link, setLink] = useState("");

  const generateLink = async () => {
    const res = await fetch("/api/shared", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, timeSlot, startTime: start, endTime: end })
    });
    const data = await res.json();
    setLink(window.location.origin + "/shared/" + data.id);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>共有スケジュール</h2>
      <input type="text" placeholder="タイトルを入力" value={title} onChange={e => setTitle(e.target.value)} />
      <div>
        <label>
          <input type="radio" checked={timeMode === "slot"} onChange={() => setTimeMode("slot")} />
          プルダウン
        </label>
        <label>
          <input type="radio" checked={timeMode === "range"} onChange={() => setTimeMode("range")} />
          時間範囲
        </label>
      </div>
      {timeMode === "slot" ? (
        <select value={timeSlot} onChange={e => setTimeSlot(e.target.value)}>
          <option>全日</option>
          <option>昼</option>
          <option>夜</option>
        </select>
      ) : (
        <div>
          <input type="time" value={start} onChange={e => setStart(e.target.value)} />
          ~
          <input type="time" value={end} onChange={e => setEnd(e.target.value)} />
        </div>
      )}
      <button onClick={generateLink}>共有リンクを発行</button>
      {link && <p><a href={link}>{link}</a></p>}
    </div>
  );
}
