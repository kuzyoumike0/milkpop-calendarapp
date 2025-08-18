import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import "./personal.css";

export default function PersonalPage() {
  const [date, setDate] = useState(new Date());
  const [title, setTitle] = useState("");

  const handleSave = async () => {
    try {
      await axios.post("/api/personal", {
        date: date.toISOString().split("T")[0],
        title,
      });
      alert("予定を保存しました！");
    } catch (err) {
      console.error("保存失敗:", err);
      alert("予定の保存に失敗しました");
    }
  };

  return (
    <div className="personal-container">
      <h2>📅 個人スケジュール</h2>

      <div className="calendar-box">
        <Calendar value={date} onChange={setDate} />
      </div>

      <input
        type="text"
        placeholder="予定のタイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="input-box"
      />

      <button onClick={handleSave} className="save-btn">
        保存
      </button>
    </div>
  );
}
