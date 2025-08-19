import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function SharePage() {
  const [title, setTitle] = useState("");
  const [dates, setDates] = useState([]);
  const [mode, setMode] = useState("multiple"); // "range" または "multiple"
  const [shareLink, setShareLink] = useState("");

  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleDateChange = (value) => {
    if (mode === "range") {
      if (Array.isArray(value)) {
        const [start, end] = value;
        if (start && end) {
          let d = new Date(start);
          const newDates = [];
          while (d <= end) {
            newDates.push(formatDate(d));
            d.setDate(d.getDate() + 1);
          }
          setDates(newDates);
        }
      }
    } else {
      const newDates = Array.isArray(value) ? value.map(formatDate) : [formatDate(value)];
      setDates(newDates);
    }
  };

  const handleCreateLink = async () => {
    if (!title || dates.length === 0) {
      alert("タイトルと日付を選択してください");
      return;
    }

    try {
      const res = await axios.post("/api/schedule-link", {
        title,
        dates,
        mode,
      });
      const { linkId } = res.data;
      setShareLink(`${window.location.origin}/share/${linkId}`);
    } catch (err) {
      console.error("リンク発行失敗:", err);
      alert("リンク発行に失敗しました");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>共有リンク作成</h2>

      <div style={{ marginBottom: "10px" }}>
        <label>タイトル: </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="イベント名を入力"
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>
          <input
            type="radio"
            value="multiple"
            checked={mode === "multiple"}
            onChange={() => setMode("multiple")}
          />
          複数選択
        </label>
        <label style={{ marginLeft: "15px" }}>
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
        onChange={handleDateChange}
        selectRange={mode === "range"}
        value={mode === "range" ? [] : null}
        tileClassName={({ date }) =>
          dates.includes(formatDate(date)) ? "selected-date" : ""
        }
      />

      <div style={{ marginTop: "10px" }}>
        <button onClick={handleCreateLink}>共有リンク発行</button>
      </div>

      {shareLink && (
        <div style={{ marginTop: "20px" }}>
          <p>✅ 共有リンクが発行されました:</p>
          <a href={shareLink} target="_blank" rel="noreferrer">
            {shareLink}
          </a>
        </div>
      )}
    </div>
  );
}
