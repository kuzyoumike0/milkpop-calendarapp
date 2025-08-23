import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // react-calendar のデフォルトCSS
import "../index.css"; // 自作CSS
import Header from "./Header";
import Footer from "./Footer";

const RegisterPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState([]);
  const [title, setTitle] = useState("");
  const [issuedUrl, setIssuedUrl] = useState("");

  // === 月切り替え ===
  const prevMonth = () => {
    const prev = new Date(currentDate);
    prev.setMonth(prev.getMonth() - 1);
    setCurrentDate(prev);
  };
  const nextMonth = () => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + 1);
    setCurrentDate(next);
  };

  // === 日付選択 ===
  const handleDateClick = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    if (selectedDates.includes(dateStr)) {
      setSelectedDates(selectedDates.filter((d) => d !== dateStr));
    } else {
      setSelectedDates([...selectedDates, dateStr]);
    }
  };

  // === URL発行 ===
  const handleIssueUrl = async () => {
    try {
      const res = await fetch("/api/share-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, scheduleIds: [] }), // TODO: scheduleIds を追加する場合はここに
      });
      const json = await res.json();
      if (json.success) {
        setIssuedUrl(`${window.location.origin}/share/${json.data.url}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Header />
      <main className="register-page">
        <div className="register-layout">
          {/* カレンダー部分 */}
          <div className="calendar-section">
            <div className="calendar-header flex justify-between items-center mb-4">
              <button onClick={prevMonth} className="month-btn">◀ 前の月</button>
              <h2 className="text-lg font-bold text-[#004CA0]">
                {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
              </h2>
              <button onClick={nextMonth} className="month-btn">次の月 ▶</button>
            </div>

            <Calendar
              className="custom-calendar" // ✅ 自作CSSを効かせる
              value={currentDate}
              onClickDay={handleDateClick}
              tileClassName={({ date }) => {
                const dateStr = date.toISOString().split("T")[0];
                return selectedDates.includes(dateStr) ? "selected" : "";
              }}
            />
          </div>

          {/* 選択中日程 */}
          <div className="schedule-section">
            <h2>選択した日程</h2>
            <ul>
              {selectedDates.map((d, idx) => (
                <li key={idx} className="schedule-card">
                  <span className="schedule-title">{d}</span>
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

            {/* 発行されたURL */}
            {issuedUrl && (
              <div className="issued-url mt-4">
                <p>✅ 発行されたURL:</p>
                <a href={issuedUrl} target="_blank" rel="noopener noreferrer">
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
