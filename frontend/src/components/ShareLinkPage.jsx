import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function ShareLinkPage() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState("range");
  const [timeSlot, setTimeSlot] = useState("終日");
  const [startHour, setStartHour] = useState(1);
  const [endHour, setEndHour] = useState(24);
  const [link, setLink] = useState(null);

  const handleCreateLink = async () => {
    try {
      const res = await axios.post("/api/create-link", {
        title,
        date,
        mode,
        timeSlot,
        startHour,
        endHour,
      });
      setLink(`${window.location.origin}/share/${res.data.linkId}`);
    } catch (err) {
      alert("リンク作成に失敗しました");
      console.error(err);
    }
  };

  return (
    <div>
      <h2>📌 日程登録ページ</h2>

      <div>
        <label>タイトル: </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div style={{ marginTop: "10px" }}>
        <Calendar value={date} onChange={setDate} />
      </div>

      <div style={{ marginTop: "10px" }}>
        <label>
          <input
            type="radio"
            value="range"
            checked={mode === "range"}
            onChange={() => setMode("range")}
          />
          範囲選択
        </label>
        <label style={{ marginLeft: "10px" }}>
          <input
            type="radio"
            value="multi"
            checked={mode === "multi"}
            onChange={() => setMode("multi")}
          />
          複数選択
        </label>
      </div>

      <div style={{ marginTop: "10px" }}>
        <label>時間帯: </label>
        <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
          <option value="終日">終日</option>
          <option value="昼">昼</option>
          <option value="夜">夜</option>
          <option value="時間指定">時間指定</option>
        </select>
        {timeSlot === "時間指定" && (
          <span>
            {" "}
            <select value={startHour} onChange={(e) => setStartHour(Number(e.target.value))}>
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}時</option>
              ))}
            </select>
            ~
            <select value={endHour} onChange={(e) => setEndHour(Number(e.target.value))}>
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}時</option>
              ))}
            </select>
          </span>
        )}
      </div>

      <button style={{ marginTop: "15px" }} onClick={handleCreateLink}>
        🔗 共有リンク発行
      </button>

      {link && (
        <div style={{ marginTop: "15px" }}>
          <p>✅ 発行されたリンク:</p>
          <a href={link} target="_blank" rel="noreferrer">{link}</a>
        </div>
      )}
    </div>
  );
}
