// frontend/src/pages/RegisterPage.jsx
import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../index.css";

const RegisterPage = () => {
  const [date, setDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState([]);
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState("multiple");

  // 📌 年月をフォーマットする関数
  const formatYearMonth = (date) => {
    return `${date.getFullYear()}年 ${date.getMonth() + 1}月`;
  };

  // 📌 月移動
  const handlePrevMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));
  };

  // 📌 日付クリック
  const handleDateChange = (newDate) => {
    if (mode === "multiple") {
      const exists = selectedDates.find(
        (d) => d.toDateString() === newDate.toDateString()
      );
      if (exists) {
        setSelectedDates(selectedDates.filter((d) => d !== exists));
      } else {
        setSelectedDates([...selectedDates, newDate]);
      }
    } else if (mode === "range") {
      if (selectedDates.length === 0 || selectedDates.length === 2) {
        setSelectedDates([newDate]);
      } else if (selectedDates.length === 1) {
        const start = selectedDates[0];
        const end = newDate;
        const range = [];
        const current = new Date(start);
        while (current <= end) {
          range.push(new Date(current));
          current.setDate(current.getDate() + 1);
        }
        setSelectedDates(range);
      }
    }
    setDate(newDate);
  };

  // 📌 日付削除
  const handleDelete = (targetDate) => {
    setSelectedDates(selectedDates.filter((d) => d !== targetDate));
  };

  return (
    <div className="register-page">
      <div className="register-layout">
        {/* === 左カラム === */}
        <div className="calendar-section">
          {/* タイトル入力 */}
          <input
            type="text"
            placeholder="タイトルを入力"
            className="input-field"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* ラジオボタン */}
          <div className="radio-options-left">
            <label className="radio-label">
              <input
                type="radio"
                name="mode"
                value="multiple"
                checked={mode === "multiple"}
                onChange={() => setMode("multiple")}
              />
              <span className="custom-radio"></span> 複数選択
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="mode"
                value="range"
                checked={mode === "range"}
                onChange={() => setMode("range")}
              />
              <span className="custom-radio"></span> 範囲選択
            </label>
          </div>

          {/* 自作ナビゲーション */}
          <div className="calendar-nav">
            <button onClick={handlePrevMonth} className="nav-btn">←</button>
            <span className="calendar-title">{formatYearMonth(date)}</span>
            <button onClick={handleNextMonth} className="nav-btn">→</button>
          </div>

          {/* カレンダー */}
          <Calendar
            onClickDay={handleDateChange}
            value={date}
            locale="ja-JP"
            navigationLabel={null}
            prevLabel={null}
            nextLabel={null}
            next2Label={null}
            prev2Label={null}
            tileClassName={({ date: d }) => {
              const isSelected = selectedDates.some(
                (s) => s.toDateString() === d.toDateString()
              );
              return isSelected ? "selected" : "";
            }}
          />
        </div>

        {/* === 右カラム === */}
        <div className="schedule-section">
          <h3>選択中の日程</h3>
          {selectedDates.length === 0 ? (
            <p>日付を選択してください</p>
          ) : (
            <ul>
              {selectedDates.map((d, idx) => (
                <li key={idx} className="schedule-card">
                  <span>
                    {d.getFullYear()}/{d.getMonth() + 1}/{d.getDate()}
                  </span>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(d)}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button className="save-btn">共有リンク発行</button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
