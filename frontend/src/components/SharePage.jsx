import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function SharePage() {
  const [title, setTitle] = useState("");
  const [dates, setDates] = useState([]); // 選択した日程（配列）
  const [mode, setMode] = useState("single"); // "single" or "range"
  const [range, setRange] = useState([null, null]);
  const [link, setLink] = useState(null);

  // 日付クリック（個別追加）
  const handleClickDay = (date) => {
    if (mode === "single") {
      const iso = date.toISOString().split("T")[0];
      if (!dates.includes(iso)) {
        setDates([...dates, iso]);
      }
    }
  };

  // 範囲選択
  const handleChange = (value) => {
    if (mode === "range") {
      setRange(value);
    }
  };

  // 範囲追加確定
  const addRange = () => {
    if (range[0] && range[1]) {
      const start = new Date(range[0]);
      const end = new Date(range[1]);
      const newDates = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        newDates.push(d.toISOString().split("T")[0]);
      }
      setDates([...new Set([...dates, ...newDates])]);
    }
  };

  // リンク発行
  const createLink = async () => {
    try {
      const res = await axios.post("/api/create-link", {
        title,
        dates,
      });
      setLink(`${window.location.origin}/share/${res.data.linkId}`);
    } catch (err) {
      console.error(err);
      alert("リンク作成に失敗しました");
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>共有リンク作成</h2>

      <label>
        タイトル:
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ marginLeft: "0.5rem" }}
        />
      </label>

      <div style={{ margin: "1rem 0" }}>
        <label>
          <input
            type="radio"
            value="single"
            checked={mode === "single"}
            onChange={() => setMode("single")}
          />
          個別選択
        </label>
        <label style={{ marginLeft: "1rem" }}>
          <input
            type="radio"
            value="range"
            checked={mode === "range"}
            onChange={() => setMode("range")}
          />
          範囲選択
        </label>
      </div>

      <Calendar
        selectRange={mode === "range"}
        onChange={handleChange}
        onClickDay={handleClickDay}
      />

      {mode === "range" && (
        <button onClick={addRange} style={{ marginTop: "0.5rem" }}>
          範囲を追加
        </button>
      )}

      <h3>選択済み日程</h3>
      <ul>
        {dates.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>

      <button onClick={createLink} style={{ marginTop: "1rem" }}>
        共有リンクを発行
      </button>

      {link && (
        <div>
          <p>共有リンク:</p>
          <a href={link} target="_blank" rel="noopener noreferrer">
            {link}
          </a>
        </div>
      )}
    </div>
  );
}
