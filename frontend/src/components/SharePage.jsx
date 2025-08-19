import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import "./SharePage.css"; // カスタムCSS

export default function SharePage({ linkId }) {
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState("single"); // "single" or "multi" or "range"
  const [selectedDates, setSelectedDates] = useState([]);
  const [range, setRange] = useState(null); // 範囲選択用
  const [timeSlot, setTimeSlot] = useState("全日");
  const [username, setUsername] = useState("");

  // === 日付フォーマット ===
  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // === 日付クリック処理 ===
  const handleDateChange = (d) => {
    if (mode === "single") {
      setDate(d);
      setSelectedDates([formatDate(d)]);
      setRange(null);
    } else if (mode === "multi") {
      const fd = formatDate(d);
      if (selectedDates.includes(fd)) {
        setSelectedDates(selectedDates.filter((x) => x !== fd));
      } else {
        setSelectedDates([...selectedDates, fd]);
      }
      setRange(null);
    } else if (mode === "range") {
      if (!range) {
        setRange([d, d]);
      } else {
        const [start] = range;
        const newRange =
          d < start ? [d, start] : [start, d];
        const days = [];
        let current = new Date(newRange[0]);
        while (current <= newRange[1]) {
          days.push(formatDate(current));
          current.setDate(current.getDate() + 1);
        }
        setRange(newRange);
        setSelectedDates(days);
      }
    }
  };

  // === 保存処理 ===
  const handleSave = async () => {
    if (!username.trim()) {
      alert("名前を入力してください");
      return;
    }
    try {
      for (const d of selectedDates) {
        await axios.post("/api/schedule", {
          username,
          date: d,
          timeslot: timeSlot,
          linkId,
        });
      }
      alert("保存しました！");
      setSelectedDates([]);
      setRange(null);
    } catch (err) {
      console.error(err);
      alert("保存に失敗しました");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>共有スケジュール登録</h2>

      {/* 名前入力 */}
      <div>
        <label>名前: </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      {/* モード選択 */}
      <div>
        <label>
          <input
            type="radio"
            value="single"
            checked={mode === "single"}
            onChange={() => setMode("single")}
          />
          単日選択
        </label>
        <label>
          <input
            type="radio"
            value="multi"
            checked={mode === "multi"}
            onChange={() => setMode("multi")}
          />
          複数選択
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

      {/* カレンダー */}
      <Calendar
        onClickDay={handleDateChange}
        value={date}
        tileClassName={({ date }) => {
          const fd = formatDate(date);
          if (selectedDates.includes(fd)) return "selected-day";
          return null;
        }}
      />

      {/* 時間帯選択 */}
      <div>
        <label>時間帯: </label>
        <select
          value={timeSlot}
          onChange={(e) => setTimeSlot(e.target.value)}
        >
          <option value="全日">全日</option>
          <option value="朝">朝</option>
          <option value="昼">昼</option>
          <option value="夜">夜</option>
        </select>
      </div>

      {/* 保存ボタン */}
      <button onClick={handleSave}>保存</button>
    </div>
  );
}
