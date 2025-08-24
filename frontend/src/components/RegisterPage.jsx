import React, { useState } from "react";
import "../index.css";
import Header from "./Header";
import Footer from "./Footer";

const daysOfWeek = ["日", "月", "火", "水", "木", "金", "土"];

const RegisterPage = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedDates, setSelectedDates] = useState([]);
  const [title, setTitle] = useState("");

  // 月の最初の日と日数を取得
  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

  // カレンダーの日付を配列にする
  const dates = [];
  for (let i = 0; i < startOfMonth.getDay(); i++) {
    dates.push(null); // 前月の余白
  }
  for (let i = 1; i <= endOfMonth.getDate(); i++) {
    dates.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
  }

  const handleDateClick = (date) => {
    const exists = selectedDates.find((d) => d.getTime() === date.getTime());
    if (exists) {
      setSelectedDates(selectedDates.filter((d) => d.getTime() !== date.getTime()));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleShare = () => {
    if (!title || selectedDates.length === 0) {
      alert("タイトルと日付を入力してください");
      return;
    }
    alert("共有リンクを発行しました！（DB保存は別途実装済み）");
  };

  return (
    <div className="page-container">
      <div className="calendar-container">
        {/* タイトル入力 */}
        <input
          type="text"
          className="input-title"
          placeholder="タイトルを入力"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* 月切り替え */}
        <div className="month-nav">
          <button className="nav-button" onClick={handlePrevMonth}>← 前の月</button>
          <span className="month-title">
            {currentMonth.getFullYear()}年 {currentMonth.getMonth() + 1}月
          </span>
          <button className="nav-button" onClick={handleNextMonth}>次の月 →</button>
        </div>

        {/* 曜日ヘッダー */}
        <div className="week-header">
          {daysOfWeek.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* カレンダー */}
        <div className="calendar-grid">
          {dates.map((date, index) => (
            <div
              key={index}
              className={
                date
                  ? `day-cell ${
                      selectedDates.find((d) => d.getTime() === date.getTime())
                        ? "selected"
                        : ""
                    }`
                  : "empty-cell"
              }
              onClick={() => date && handleDateClick(date)}
            >
              {date ? date.getDate() : ""}
            </div>
          ))}
        </div>
      </div>

      {/* 選択日リスト */}
      <div className="selected-container">
        <h2>選択中の日程</h2>
        {selectedDates.length === 0 ? (
          <p className="page-text">まだ日程が選択されていません。</p>
        ) : (
          selectedDates
            .sort((a, b) => a - b)
            .map((date, index) => (
              <div key={index} className="selected-date">
                {date.getFullYear()}/{date.getMonth() + 1}/{date.getDate()}
              </div>
            ))
        )}
        {/* 共有リンクボタン */}
        <button className="share-button" onClick={handleShare}>
          共有リンクを発行
        </button>
      </div>
    </div>
  );
};

export default RegisterPage;
