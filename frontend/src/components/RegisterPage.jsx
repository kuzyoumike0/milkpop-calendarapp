// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import "../index.css";
import Holidays from "date-holidays";

const RegisterPage = () => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDates, setSelectedDates] = useState([]);

  const hd = new Holidays("JP"); // 日本の祝日

  // 日数を計算
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();
  const totalDays = lastDay.getDate();

  // 前月・次月移動
  const prevMonth = () => {
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else {
      setMonth(month - 1);
    }
  };
  const nextMonth = () => {
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
  };

  // 日付クリック処理
  const handleDateClick = (date) => {
    const exists = selectedDates.find((d) => d.date.getTime() === date.getTime());
    if (exists) {
      setSelectedDates(selectedDates.filter((d) => d.date.getTime() !== date.getTime()));
    } else {
      setSelectedDates([...selectedDates, { date, time: "終日" }]);
    }
  };

  // プルダウン変更
  const handleTimeChange = (date, value) => {
    setSelectedDates(
      selectedDates.map((d) =>
        d.date.getTime() === date.getTime() ? { ...d, time: value } : d
      )
    );
  };

  // 日付削除
  const handleDelete = (date) => {
    setSelectedDates(selectedDates.filter((d) => d.date.getTime() !== date.getTime()));
  };

  // ソート済み日程
  const sortedDates = [...selectedDates].sort((a, b) => a.date - b.date);

  return (
    <div className="register-layout">
      {/* ===== カレンダー ===== */}
      <div className="calendar-section">
        <div className="calendar-header">
          <button onClick={prevMonth}>←</button>
          <h2>{`${year}年 ${month + 1}月`}</h2>
          <button onClick={nextMonth}>→</button>
        </div>

        <div className="calendar-weekdays">
          {["日", "月", "火", "水", "木", "金", "土"].map((w) => (
            <div key={w} className="calendar-weekday">{w}</div>
          ))}
        </div>

        <div className="calendar-grid">
          {Array(startDay).fill(null).map((_, i) => (
            <div key={`empty-${i}`} className="calendar-day empty"></div>
          ))}
          {Array(totalDays).fill(null).map((_, i) => {
            const day = i + 1;
            const date = new Date(year, month, day);
            const holiday = hd.isHoliday(date);
            const isToday = date.toDateString() === today.toDateString();
            const isSelected = selectedDates.find((d) => d.date.getTime() === date.getTime());

            return (
              <div
                key={day}
                className={`calendar-day ${isToday ? "today" : ""} ${isSelected ? "selected" : ""} ${holiday ? "holiday" : ""}`}
                onClick={() => handleDateClick(date)}
              >
                {day}
                {holiday && <div className="holiday-label">{holiday[0].name}</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== 登録済み日程リスト ===== */}
      <div className="schedule-section">
        <h3>📅 登録済みの日程</h3>
        {sortedDates.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666" }}>まだ日程が登録されていません</p>
        ) : (
          sortedDates.map(({ date, time }) => (
            <div key={date.toISOString()} className="schedule-item">
              <span>
                {date.getMonth() + 1}/{date.getDate()}
              </span>
              <select
                value={time}
                onChange={(e) => handleTimeChange(date, e.target.value)}
              >
                <option value="終日">終日</option>
                <option value="午前">午前</option>
                <option value="午後">午後</option>
                <option value="夜">夜</option>
                <option value="時間指定">時間指定</option>
              </select>
              <button className="delete-button" onClick={() => handleDelete(date)}>×</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
