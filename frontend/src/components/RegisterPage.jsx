import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../index.css";

const RegisterPage = () => {
  const [date, setDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState([]);
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState("multiple");

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

  const handleDelete = (targetDate) => {
    setSelectedDates(selectedDates.filter((d) => d !== targetDate));
  };

  return (
    <div className="register-page">
      <div className="register-layout">
        <div className="calendar-section">
          {/* 入力フォーム */}
          <input
            type="text"
            placeholder="タイトルを入力"
            className="input-field"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* ラジオボタン */}
          <div className="radio-options">
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

          {/* カレンダー */}
          <Calendar
            onChange={handleDateChange}
            value={date}
            selectRange={mode === "range"}
            className="react-calendar"
            tileClassName={({ date }) => {
              const isSelected = selectedDates.some(
                (d) => d.toDateString() === date.toDateString()
              );
              if (isSelected) return "selected";
              return "";
            }}
          />
        </div>

        {/* 選択中リスト */}
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
