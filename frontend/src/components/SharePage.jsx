import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function SharePage() {
  const [dates, setDates] = useState([]);
  const [mode, setMode] = useState("multi");
  const [title, setTitle] = useState("");

  const handleChange = (value) => {
    if (mode === "range" && Array.isArray(value)) {
      const start = value[0];
      const end = value[1];
      if (start && end) {
        const arr = [];
        let cur = new Date(start);
        while (cur <= end) {
          arr.push(cur.toISOString().split("T")[0]);
          cur.setDate(cur.getDate() + 1);
        }
        setDates(arr);
      }
    }
  };

  const handleClickDay = (date) => {
    if (mode === "multi") {
      const iso = date.toISOString().split("T")[0];
      if (dates.includes(iso)) {
        setDates(dates.filter((d) => d !== iso));
      } else {
        setDates([...dates, iso]);
      }
    }
  };

  const createLink = async () => {
    try {
      const res = await axios.post("/api/create-link", { title, dates });
      alert(`共有リンク: ${window.location.origin}/link/${res.data.linkId}`);
    } catch (err) {
      console.error(err);
      alert("リンク作成失敗");
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>共有リンク作成</h2>

      <input
        type="text"
        placeholder="タイトル（例: 飲み会調整）"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ display: "block", marginBottom: "1rem", padding: "0.5rem" }}
      />

      <div>
        <label>
          <input
            type="radio"
            checked={mode === "multi"}
            onChange={() => setMode("multi")}
          />
          複数選択
        </label>
        <label style={{ marginLeft: "1rem" }}>
          <input
            type="radio"
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
        tileClassName={({ date }) => {
          const iso = date.toISOString().split("T")[0];
          return dates.includes(iso) ? "selected-day" : null;
        }}
      />

      <style>
        {`
          .selected-day {
            background: #4caf50 !important;
            color: white !important;
            border-radius: 50% !important;
          }
        `}
      </style>

      <button
        onClick={createLink}
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          background: "#2196f3",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        共有リンクを発行
      </button>
    </div>
  );
}
