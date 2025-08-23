import React, { useState } from "react";
import "../index.css";
import Header from "./Header";
import Footer from "./Footer";

const daysOfWeek = ["日", "月", "火", "水", "木", "金", "土"];

const RegisterPage = () => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState([]);
  const [title, setTitle] = useState("");
  const [issuedUrl, setIssuedUrl] = useState("");

  // === 今の月の日数を計算 ===
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // === 日付クリック ===
  const handleDateClick = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    if (selectedDates.includes(dateStr)) {
      setSelectedDates(selectedDates.filter((d) => d !== dateStr));
    } else {
      setSelectedDates([...selectedDates, dateStr]);
    }
  };

  // === 選択リストから削除 ===
  const handleDeleteDate = (dateStr) => {
    setSelectedDates(selectedDates.filter((d) => d !== dateStr));
  };

  // === URL発行 ===
  const handleIssueUrl = async () => {
    try {
      const res = await fetch("/api/share-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, scheduleIds: [] }),
      });
      const json = await res.json();
      if (json.success) {
        setIssuedUrl(`${window.location.origin}/share/${json.data.url}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // === カレンダー描画用セル ===
  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(
      <div key={`empty-${i}`} className="calendar-cell empty"></div>
    );
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    const isToday =
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day;
    const isSelected = selectedDates.includes(dateStr);

    cells.push(
      <div
        key={day}
        className={`calendar-cell ${isToday ? "today" : ""} ${
          isSelected ? "selected" : ""
        }`}
        onClick={() => handleDateClick(day)}
      >
        {day}
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="register-page">
        <div className="register-layout">
          {/* カレンダー */}
          <div className="calendar-section">
            <div className="calendar-header flex justify-between items-center mb-4">
              <button onClick={prevMonth} className="month-btn">
                ◀ 前の月
              </button>
              <h2 className="text-lg font-bold text-[#004CA0]">
                {year}年 {month + 1}月
              </h2>
              <button onClick={nextMonth} className="month-btn">
                次の月 ▶
              </button>
            </div>

            <div className="custom-calendar">
              {daysOfWeek.map((d, idx) => (
                <div key={idx} className="calendar-day-header">
                  {d}
                </div>
              ))}
              {cells}
            </div>
          </div>

          {/* 選択した日程 */}
          <div className="schedule-section">
            <h2>選択した日程</h2>
            <ul>
              {selectedDates.map((d, idx) => (
                <li key={idx} className="schedule-card">
                  <span className="schedule-title">{d}</span>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteDate(d)}
                  >
                    ✖
                  </button>
                </li>
              ))}
            </ul>

            {/* タイトル入力 */}
            <div className="mt-4">
              <input
                type="text"
                placeholder="タイトルを入力"
                className="w-full border-2 border-[#FDB9C8] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#004CA0]"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* URL発行ボタン */}
            <button onClick={handleIssueUrl} className="save-btn mt-6">
              🔗 共有リンクを発行
            </button>

            {issuedUrl && (
              <div className="issued-url mt-4">
                <p>✅ 発行されたURL:</p>
                <a
                  href={issuedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {issuedUrl}
                </a>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default RegisterPage;
