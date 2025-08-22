// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import Calendar from "react-calendar";
import "../index.css";
import SelectMode from "./SelectMode";


const RegisterPage = () => {
  const [mode, setMode] = useState("range"); // "range" | "multi"
  const [selectedDates, setSelectedDates] = useState([]);

  // 日付クリック時の挙動
  const handleDateClick = (date) => {
    if (mode === "multi") {
      // 複数選択
      if (selectedDates.some(d => d.toDateString() === date.toDateString())) {
        setSelectedDates(selectedDates.filter(d => d.toDateString() !== date.toDateString()));
      } else {
        setSelectedDates([...selectedDates, date]);
      }
    } else {
      // 範囲選択
      if (selectedDates.length === 0 || selectedDates.length === 2) {
        setSelectedDates([date]);
      } else if (selectedDates.length === 1) {
        const start = selectedDates[0];
        const range = start < date ? [start, date] : [date, start];
        setSelectedDates(range);
      }
    }
  };

  // カレンダーの日付タイルにスタイルを適用
  const tileClassName = ({ date }) => {
    if (mode === "multi") {
      return selectedDates.some(d => d.toDateString() === date.toDateString())
        ? "selected-date"
        : null;
    }
    if (mode === "range" && selectedDates.length === 2) {
      const [start, end] = selectedDates;
      return date >= start && date <= end ? "selected-range" : null;
    }
    if (mode === "range" && selectedDates.length === 1) {
      return date.toDateString() === selectedDates[0].toDateString()
        ? "selected-range"
        : null;
    }
    return null;
  };

  return (
    <div className="page-container">
      <h2 className="page-title">日程登録ページ</h2>

      {/* ラジオボタン */}
      <SelectMode mode={mode} setMode={setMode} />

      {/* カレンダー */}
      <div className="calendar-wrapper">
        <Calendar
          onClickDay={handleDateClick}
          tileClassName={tileClassName}
        />
      </div>

      {/* 選択結果を下に表示 */}
      <div className="selected-output">
        <h3>選択した日程</h3>
        {mode === "multi" && (
          <ul>
            {selectedDates.map((d, i) => (
              <li key={i}>{d.toLocaleDateString()}</li>
            ))}
          </ul>
        )}
        {mode === "range" && selectedDates.length > 0 && (
          <p>
            {selectedDates[0].toLocaleDateString()}
            {selectedDates[1] && ` 〜 ${selectedDates[1].toLocaleDateString()}`}
          </p>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
