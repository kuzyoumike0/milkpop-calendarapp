import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function SharePage() {
  const navigate = useNavigate();
  const [selectedDates, setSelectedDates] = useState([]);
  const [mode, setMode] = useState("multiple"); // "range" or "multiple"
  const [username, setUsername] = useState("");

  const [categoryType, setCategoryType] = useState("allday"); // allday, daytime, night, custom
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");

  // 複数日クリックで選択
  const handleDateClick = (date) => {
    if (mode === "multiple") {
      const dateStr = date.toISOString().split("T")[0];
      if (selectedDates.includes(dateStr)) {
        setSelectedDates(selectedDates.filter((d) => d !== dateStr));
      } else {
        setSelectedDates([...selectedDates, dateStr]);
      }
    }
  };

  // 範囲選択
  const handleRangeChange = (range) => {
    if (mode === "range" && range[0] && range[1]) {
      const dates = [];
      let current = new Date(range[0]);
      while (current <= range[1]) {
        dates.push(current.toISOString().split("T")[0]);
        current.setDate(current.getDate() + 1);
      }
      setSelectedDates(dates);
    }
  };

  // 共有リンク発行
  const handleShare = async () => {
    if (selectedDates.length === 0) {
      alert("日程を選択してください");
      return;
    }

    try {
      const res = await axios.post("/api/sharelink", {
        dates: selectedDates,
        username,
        category: categoryType,
        startTime,
        endTime,
      });

      const linkId = res.data.linkId;
      navigate(`/share/${linkId}`); // リンクページに遷移
    } catch (err) {
      console.error("共有リンク作成失敗:", err);
      alert("共有リンクの発行に失敗しました");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>共有ページ</h2>

      <div>
        <label>名前: </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="あなたの名前"
        />
      </div>

      <div>
        <label>
          <input
            type="radio"
            value="multiple"
            checked={mode === "multiple"}
            onChange={() => setMode("multiple")}
          />
          複数日選択
        </label>
        <label>
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
        onClickDay={handleDateClick}
        onChange={handleRangeChange}
      />

      <div style={{ marginTop: "15px" }}>
        <label>
          <input
            type="radio"
            value="allday"
            checked={categoryType === "allday"}
            onChange={() => setCategoryType("allday")}
          />
          終日
        </label>
        <label>
          <input
            type="radio"
            value="daytime"
            checked={categoryType === "daytime"}
            onChange={() => setCategoryType("daytime")}
          />
          昼（13:00-18:00）
        </label>
        <label>
          <input
            type="radio"
            value="night"
            checked={categoryType === "night"}
            onChange={() => setCategoryType("night")}
          />
          夜（21:00-00:00）
        </label>
        <label>
          <input
            type="radio"
            value="custom"
            checked={categoryType === "custom"}
            onChange={() => setCategoryType("custom")}
          />
          時間指定
        </label>
      </div>

      {categoryType === "custom" && (
        <div>
          <select value={startTime} onChange={(e) => setStartTime(e.target.value)}>
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={`${String(i).padStart(2, "0")}:00`}>
                {i}:00
              </option>
            ))}
          </select>
          ～
          <select value={endTime} onChange={(e) => setEndTime(e.target.value)}>
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={`${String(i).padStart(2, "0")}:00`}>
                {i}:00
              </option>
            ))}
          </select>
        </div>
      )}

      <button onClick={handleShare} style={{ marginTop: "20px" }}>
        共有リンクを発行
      </button>
    </div>
  );
}
