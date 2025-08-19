import React, { useState } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function SharePage() {
  const [selectedDates, setSelectedDates] = useState([new Date(), new Date()]);
  const [title, setTitle] = useState("");   // 🔹 タイトルのみ
  const [timeSlot, setTimeSlot] = useState("全日");
  const [mode, setMode] = useState("range");
  const [shareLink, setShareLink] = useState("");

  const formatDate = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;

  // 🔹 共有リンク発行
  const handleGenerateLink = async () => {
    let datesToSave = [];
    if (mode === "range") {
      const [start, end] = selectedDates;
      let cur = new Date(start);
      while (cur <= end) {
        datesToSave.push(formatDate(new Date(cur)));
        cur.setDate(cur.getDate() + 1);
      }
    } else if (mode === "multiple") {
      datesToSave = selectedDates.map((d) => formatDate(d));
    }

    try {
      const res = await axios.post("/api/create-link", {
        title,      // 🔹 タイトルのみ送信
        dates: datesToSave,
        timeSlot,
        mode,
      });

      setShareLink(`${window.location.origin}/share/${res.data.linkId}`);
    } catch (err) {
      console.error("共有リンク発行失敗:", err);
      alert("リンク発行に失敗しました");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>新しい共有リンクを発行</h2>

      <div>
        <label>タイトル: </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例: 旅行日程調整"
        />
      </div>

      <div>
        <label>モード: </label>
        <label>
          <input
            type="radio"
            value="range"
            checked={mode === "range"}
            onChange={() => setMode("range")}
          />
          範囲選択
        </label>
        <label>
          <input
            type="radio"
            value="multiple"
            checked={mode === "multiple"}
            onChange={() => setMode("multiple")}
          />
          複数選択
        </label>
      </div>

      <Calendar
        selectRange={mode === "range"}
        onChange={(value) => setSelectedDates(value)}
        value={selectedDates}
      />

      <div>
        <label>時間帯: </label>
        <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
          <option value="全日">全日</option>
          <option value="昼">昼</option>
          <option value="夜">夜</option>
        </select>
      </div>

      <button onClick={handleGenerateLink}>共有リンクを発行</button>

      {shareLink && (
        <div style={{ marginTop: "20px" }}>
          <p>このリンクを共有してください:</p>
          <a href={shareLink} target="_blank" rel="noopener noreferrer">
            {shareLink}
          </a>
        </div>
      )}
    </div>
  );
}
