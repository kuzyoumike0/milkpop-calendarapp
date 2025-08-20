import React, { useState } from "react";
import axios from "axios";
import CustomCalendar from "./CustomCalendar";

export default function LinkPage() {
  const [title, setTitle] = useState("");
  const [dates, setDates] = useState([]);
  const [rangeMode, setRangeMode] = useState("multiple");
  const [timeSlot, setTimeSlot] = useState("全日");
  const [shareUrl, setShareUrl] = useState("");

  const handleSubmit = async () => {
    if (!title || dates.length === 0) return alert("タイトルと日程を入力してください");

    try {
      const start_date = dates[0];
      const end_date = dates.length > 1 ? dates[dates.length - 1] : dates[0];

      const res = await axios.post("/api/schedule", {
        title,
        start_date,
        end_date,
        timeslot: timeSlot,
        range_mode: rangeMode,
      });
      setShareUrl(window.location.origin + res.data.link);
    } catch (err) {
      alert("登録に失敗しました");
    }
  };

  return (
    <div style={{ backgroundColor: "#000", color: "white", minHeight: "100vh", padding: "20px" }}>
      <header style={{ background: "#004CA0", padding: "15px", fontSize: "20px", fontWeight: "bold" }}>MilkPOP Calendar</header>
      <h2 style={{ color: "#FDB9C8" }}>日程登録ページ</h2>

      <input
        type="text"
        placeholder="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ padding: "10px", margin: "10px 0", width: "100%" }}
      />

      {/* カレンダー */}
      <CustomCalendar rangeMode={rangeMode} dates={dates} setDates={setDates} />

      {/* モード選択 */}
      <div>
        <label>
          <input type="radio" value="range" checked={rangeMode === "range"} onChange={() => setRangeMode("range")} />
          範囲選択
        </label>
        <label>
          <input type="radio" value="multiple" checked={rangeMode === "multiple"} onChange={() => setRangeMode("multiple")} />
          複数選択
        </label>
      </div>

      {/* 時間帯 */}
      <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} style={{ margin: "10px 0", padding: "10px" }}>
        <option value="全日">全日</option>
        <option value="昼">昼</option>
        <option value="夜">夜</option>
      </select>

      <button onClick={handleSubmit} style={{ background: "#FDB9C8", color: "#000", padding: "10px 20px", border: "none", borderRadius: "8px" }}>
        登録
      </button>

      {shareUrl && (
        <div style={{ marginTop: "20px" }}>
          <p>共有リンク:</p>
          <a href={shareUrl} style={{ color: "#FDB9C8" }} target="_blank" rel="noopener noreferrer">{shareUrl}</a>
        </div>
      )}
    </div>
  );
}
