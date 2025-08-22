import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../index.css";

const RegisterPage = () => {
  const [mode, setMode] = useState("range"); // 範囲 or 複数選択
  const [range, setRange] = useState([null, null]);
  const [multiDates, setMultiDates] = useState([]);
  const [title, setTitle] = useState("");

  // 日付クリック処理
  const handleDateChange = (value) => {
    if (mode === "range") {
      setRange(value);
    } else {
      setMultiDates(value);
    }
  };

  return (
    <div className="page-container">
      <main>
        <h2 className="page-title">日程登録</h2>
        <input
          type="text"
          placeholder="タイトルを入力"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div style={{ margin: "20px 0" }}>
          <label className="radio-label">
            <input
              type="radio"
              name="mode"
              value="range"
              checked={mode === "range"}
              onChange={() => setMode("range")}
            />
            範囲選択
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="mode"
              value="multi"
              checked={mode === "multi"}
              onChange={() => setMode("multi")}
            />
            複数選択
          </label>
        </div>

        <Calendar
          onChange={handleDateChange}
          value={mode === "range" ? range : multiDates}
          selectRange={mode === "range"}
          className="custom-calendar"
        />

        <button className="submit-btn" style={{ marginTop: "20px" }}>
          保存 & 共有リンク発行
        </button>
      </main>
    </div>
  );
};

export default RegisterPage;
