import React, { useState } from "react";
import axios from "axios";
import CustomCalendar from "./CustomCalendar";

export default function PersonalPage() {
  const [username, setUsername] = useState("");
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [dates, setDates] = useState([]);
  const [rangeMode, setRangeMode] = useState("multiple");
  const [timeSlot, setTimeSlot] = useState("全日");

  const handleSubmit = async () => {
    if (!username || dates.length === 0) return alert("名前と日程を入力してください");

    try {
      const start_date = dates[0];
      const end_date = dates.length > 1 ? dates[dates.length - 1] : dates[0];

      await axios.post("/api/personal", {
        username,
        title,
        memo,
        start_date,
        end_date,
        timeslot: timeSlot,
        range_mode: rangeMode,
      });
      alert("保存しました！");
    } catch (err) {
      alert("保存に失敗しました");
    }
  };

  return (
    <div style={{ backgroundColor: "#000", color: "white", minHeight: "100vh", padding: "20px" }}>
      <header style={{ background: "#004CA0", padding: "15px", fontSize: "20px", fontWeight: "bold" }}>MilkPOP Calendar</header>
      <h2 style={{ color: "#FDB9C8" }}>個人スケジュール登録</h2>

      <input type="text" placeholder="名前" value={username} onChange={(e) => setUsername(e.target.value)} style={{ padding: "10px", margin: "5px 0", width: "100%" }} />
      <input type="text" placeholder="タイトル" value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: "10px", margin: "5px 0", width: "100%" }} />
      <textarea placeholder="メモ" value={memo} onChange={(e) => setMemo(e.target.value)} style={{ padding: "10px", margin: "5px 0", width: "100%", height: "80px" }} />

      <CustomCalendar rangeMode={rangeMode} dates={dates} setDates={setDates} />

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

      <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} style={{ margin: "10px 0", padding: "10px" }}>
        <option value="全日">全日</option>
        <option value="昼">昼</option>
        <option value="夜">夜</option>
      </select>

      <button onClick={handleSubmit} style={{ background: "#FDB9C8", color: "#000", padding: "10px 20px", border: "none", borderRadius: "8px" }}>
        保存
      </button>
    </div>
  );
}
