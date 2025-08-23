import React, { useState } from "react";
import "../index.css";

const daysOfWeek = ["日", "月", "火", "水", "木", "金", "土"];

const RegisterPage = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedDates, setSelectedDates] = useState([]);
  const [title, setTitle] = useState("");
  const [savedSchedules, setSavedSchedules] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc"); // 並び順管理

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  // ===== 日付クリックで選択・解除 =====
  const handleDateClick = (date) => {
    if (selectedDates.includes(date)) {
      setSelectedDates(selectedDates.filter((d) => d !== date));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  // ===== 選択解除ボタン =====
  const handleRemoveSelected = (date) => {
    setSelectedDates(selectedDates.filter((d) => d !== date));
  };

  // ===== 月切り替え =====
  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  // ===== 保存処理 =====
  const handleSave = () => {
    if (!title || selectedDates.length === 0) {
      alert("タイトルと日付を入力してください！");
      return;
    }
    const sortedDates = [...selectedDates].sort((a, b) => a - b); // 昇順ソート
    setSavedSchedules([
      ...savedSchedules,
      { id: Date.now(), title, dates: sortedDates, month, year },
    ]);
    setTitle("");
    setSelectedDates([]);
  };

  // ===== 削除処理（保存済み） =====
  const handleDelete = (id) => {
    setSavedSchedules(savedSchedules.filter((s) => s.id !== id));
  };

  // ===== 登録済みスケジュールを並べ替え =====
  const sortedSchedules = [...savedSchedules].sort((a, b) => {
    const dateA = new Date(a.year, a.month, a.dates[0]);
    const dateB = new Date(b.year, b.month, b.dates[0]);
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  // ===== 選択済み日程を昇順で表示 =====
  const sortedSelectedDates = [...selectedDates].sort((a, b) => a - b);

  return (
    <div className="register-page">
      <div className="banner">MilkPOP Calendar</div>

      <div className="register-layout">
        {/* ===== 左：カレンダー 7割 ===== */}
        <div className="calendar-section">
          <h2 className="form-title">
            {year}年 {month + 1}月
          </h2>
          <div className="calendar-nav">
            <button onClick={prevMonth}>← 前の月</button>
            <button onClick={nextMonth}>次の月 →</button>
          </div>

          {/* カレンダー */}
          <div className="calendar-grid custom-calendar">
            {daysOfWeek.map((day) => (
              <div key={day} className="calendar-day-header">
                {day}
              </div>
            ))}

            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="calendar-cell empty"></div>
            ))}

            {Array.from({ length: lastDate }).map((_, i) => {
              const date = i + 1;
              const isToday =
                year === today.getFullYear() &&
                month === today.getMonth() &&
                date === today.getDate();
              const isSelected = selectedDates.includes(date);

              return (
                <div
                  key={date}
                  className={`calendar-cell ${
                    isToday ? "today" : ""
                  } ${isSelected ? "selected" : ""}`}
                  onClick={() => handleDateClick(date)}
                >
                  {date}
                </div>
              );
            })}
          </div>

          {/* 選択中の日程（カード表示） */}
          {sortedSelectedDates.length > 0 && (
            <div className="selected-dates mt-4">
              <h3 className="form-title">選択中の日程</h3>
              <ul>
                {sortedSelectedDates.map((d, i) => (
                  <li key={i} className="schedule-card">
                    <span className="date-tag">
                      {month + 1}/{d}
                    </span>
                    <button
                      className="delete-btn-small"
                      onClick={() => handleRemoveSelected(d)}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* タイトル入力 */}
          <div className="form-group mt-4">
            <label>タイトル</label>
            <input
              type="text"
              value={title}
              placeholder="予定タイトルを入力"
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <button className="save-btn" onClick={handleSave}>
            登録する
          </button>
        </div>

        {/* ===== 右：登録済みリスト 3割 ===== */}
        <div className="schedule-section">
          <h2 className="form-title">登録済み日程</h2>

          {/* 並び順切り替え */}
          <div className="sort-toggle">
            <label>並び順: </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="asc">古い順</option>
              <option value="desc">新しい順</option>
            </select>
          </div>

          {sortedSchedules.length === 0 ? (
            <p className="text-gray">まだ日程がありません</p>
          ) : (
            <ul>
              {sortedSchedules.map((s) => (
                <li key={s.id} className="schedule-card">
                  <span className="schedule-title">{s.title}</span>
                  <div>
                    {s.dates.map((d, i) => (
                      <span key={i} className="date-tag">
                        {s.month + 1}/{d}
                      </span>
                    ))}
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(s.id)}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
