import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function SharePage() {
  const [mode, setMode] = useState("range"); // "range" or "multiple"
  const [rangeValue, setRangeValue] = useState([new Date(), new Date()]);
  const [multiValue, setMultiValue] = useState([]);
  const [categoryType, setCategoryType] = useState("allday"); // allday/day/night/time
  const [startTime, setStartTime] = useState("01:00");
  const [endTime, setEndTime] = useState("00:00");
  const [username, setUsername] = useState("");

  // 複数選択モード
  const handleMultiClick = (date) => {
    const dateStr = date.toDateString();
    if (multiValue.find((d) => d.toDateString() === dateStr)) {
      setMultiValue(multiValue.filter((d) => d.toDateString() !== dateStr));
    } else {
      setMultiValue([...multiValue, date]);
    }
  };

  // 共有リンク発行
  const handleShare = async () => {
    let selectedDates = [];

    if (mode === "range") {
      const [start, end] = rangeValue;
      let cur = new Date(start);
      while (cur <= end) {
        selectedDates.push(new Date(cur));
        cur.setDate(cur.getDate() + 1);
      }
    } else {
      selectedDates = multiValue;
    }

    try {
      const res = await axios.post("/api/shared", {
        dates: selectedDates.map((d) => d.toISOString().split("T")[0]),
        username,
        category: categoryType,
        startTime: categoryType === "time" ? startTime : null,
        endTime: categoryType === "time" ? endTime : null,
      });
      alert(`共有リンク: ${window.location.origin}/share/${res.data.linkId}`);
    } catch (err) {
      console.error(err);
      alert("共有リンクの発行に失敗しました");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>予定の共有ページ</h2>

      {/* ユーザー名 */}
      <div>
        <label>名前: </label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>

      {/* 範囲 / 複数切り替え */}
      <div>
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

      {/* カレンダー */}
      <Calendar
        selectRange={mode === "range"}
        onChange={(val) => {
          if (mode === "range") setRangeValue(val);
        }}
        value={mode === "range" ? rangeValue : multiValue}
        tileClassName={({ date }) =>
          multiValue.find((d) => d.toDateString() === date.toDateString())
            ? "selected-date"
            : ""
        }
        onClickDay={(date) => {
          if (mode === "multiple") handleMultiClick(date);
        }}
      />

      {/* 区分のプルダウン */}
      <div style={{ marginTop: "10px" }}>
        <label>区分: </label>
        <select
          value={categoryType}
          onChange={(e) => setCategoryType(e.target.value)}
        >
          <option value="allday">終日</option>
          <option value="day">昼（13時〜18時）</option>
          <option value="night">夜（21時〜0時）</option>
          <option value="time">時間帯指定</option>
        </select>
      </div>

      {/* 時間帯指定プルダウン */}
      {categoryType === "time" && (
        <div>
          <label>開始: </label>
          <select value={startTime} onChange={(e) => setStartTime(e.target.value)}>
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i}>{String(i).padStart(2, "0")}:00</option>
            ))}
          </select>
          <label>終了: </label>
          <select value={endTime} onChange={(e) => setEndTime(e.target.value)}>
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i}>{String(i).padStart(2, "0")}:00</option>
            ))}
          </select>
        </div>
      )}

      {/* 共有ボタン */}
      <button style={{ marginTop: "10px" }} onClick={handleShare}>
        共有リンクを発行
      </button>

      {/* 選択スタイル */}
      <style>
        {`
          .selected-date {
            background: #4caf50;
            color: white;
            border-radius: 50%;
          }
        `}
      </style>
    </div>
  );
}
