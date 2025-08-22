// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import Calendar from "react-calendar";
import SelectMode from "./SelectMode";
import "../index.css";

const RegisterPage = () => {
  const [mode, setMode] = useState("range"); // 範囲 or 複数
  const [selectedDates, setSelectedDates] = useState([]);

  // 日付クリック
  const handleDateClick = (date) => {
    if (mode === "multi") {
      // 複数選択モード
      if (selectedDates.some(d => d.toDateString() === date.toDateString())) {
        setSelectedDates(selectedDates.filter(d => d.toDateString() !== date.toDateString()));
      } else {
        setSelectedDates([...selectedDates, date]);
      }
    } else {
      // 範囲選択モード
      if (selectedDates.length === 0 || selectedDates.length === 2) {
        setSelectedDates([date]);
      } else if (selectedDates.length === 1) {
        const start = selectedDates[0];
        const range = start < date ? [start, date] : [date, start];
        let datesInRange = [];
        let cur = new Date(range[0]);
        while (cur <= range[1]) {
          datesInRange.push(new Date(cur));
          cur.setDate(cur.getDate() + 1);
        }
        setSelectedDates(datesInRange);
      }
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-title">日程登録ページ</h2>

      <div className="register-layout">
        {/* ===== 左：カレンダー ===== */}
        <div className="calendar-section">
          <div className="calendar-header">
            <SelectMode mode={mode} setMode={setMode} />
          </div>
          <Calendar
            onClickDay={handleDateClick}
            tileClassName={({ date }) =>
              selectedDates.some(d => d.toDateString() === date.toDateString())
                ? "selected-date"
                : null
            }
          />
        </div>

        {/* ===== 右：選択日程リスト ===== */}
        <div className="schedule-section">
          <h3>選択した日程</h3>
          {selectedDates.length === 0 && <p>日程を選択してください。</p>}
          {selectedDates.map((d, i) => (
            <div key={i} className="schedule-item">
              <span>{d.toLocaleDateString()}</span>
              <select className="vote-select">
                <option value="">区分を選択</option>
                <option value="ok">○ 出席</option>
                <option value="ng">✕ 欠席</option>
                <option value="maybe">△ 未定</option>
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
