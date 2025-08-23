import React, { useState } from "react";
import "../index.css";
import Header from "./Header";
import Footer from "./Footer";

const daysOfWeek = ["日", "月", "火", "水", "木", "金", "土"];

const RegisterPage = () => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState([]);
  const [dateOptions, setDateOptions] = useState({}); // 日付ごとの区分を管理
  const [title, setTitle] = useState("");
  const [issuedUrl, setIssuedUrl] = useState("");
  const [selectionMode, setSelectionMode] = useState("multiple");
  const [rangeStart, setRangeStart] = useState(null);

  // === 今の月の日数 ===
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

    if (selectionMode === "multiple") {
      if (selectedDates.includes(dateStr)) {
        setSelectedDates(selectedDates.filter((d) => d !== dateStr));
        const updated = { ...dateOptions };
        delete updated[dateStr];
        setDateOptions(updated);
      } else {
        setSelectedDates([...selectedDates, dateStr]);
        setDateOptions({ ...dateOptions, [dateStr]: "終日" }); // デフォルト:終日
      }
    } else if (selectionMode === "range") {
      if (!rangeStart) {
        setRangeStart(dateStr);
        setSelectedDates([dateStr]);
        setDateOptions({ [dateStr]: "終日" });
      } else {
        let start = new Date(rangeStart);
        let end = new Date(dateStr);
        if (start > end) [start, end] = [end, start];

        const range = [];
        const options = { ...dateOptions };
        const cursor = new Date(start);
        while (cursor <= end) {
          const d = `${cursor.getFullYear()}-${String(
            cursor.getMonth() + 1
          ).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
          range.push(d);
          if (!options[d]) options[d] = "終日";
          cursor.setDate(cursor.getDate() + 1);
        }
        setSelectedDates(range);
        setDateOptions(options);
        setRangeStart(null);
      }
    }
  };

  // === 区分プルダウン変更 ===
  const handleOptionChange = (dateStr, value) => {
    setDateOptions({ ...dateOptions, [dateStr]: value });
  };

  // === 選択リストから削除 ===
  const handleDeleteDate = (dateStr) => {
    setSelectedDates(selectedDates.filter((d) => d !== dateStr));
    const updated = { ...dateOptions };
    delete updated[dateStr];
    setDateOptions(updated);
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

  // === カレンダーセル ===
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
            {/* タイトル */}
            <div className="mb-6 text-left">
              <label className="block text-[#004CA0] font-bold mb-2 text-lg">
                📌 タイトル
              </label>
              <input
                type="text"
                placeholder="タイトルを入力してください"
                className="input-field"
                value={title}
                onChange={(e) => setTitle(e.target.value.replace(/_/g, ""))}
              />
            </div>

            {/* 選択モード */}
            <div className="mb-6 text-left">
              <label className="block text-[#004CA0] font-bold mb-2 text-lg">
                🔽 選択モード
              </label>
              <div className="radio-options">
                <label className="radio-label">
                  <input
                    type="radio"
                    value="multiple"
                    checked={selectionMode === "multiple"}
                    onChange={(e) => setSelectionMode(e.target.value)}
                  />
                  <span className="custom-radio"></span>
                  複数選択
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    value="range"
                    checked={selectionMode === "range"}
                    onChange={(e) => setSelectionMode(e.target.value)}
                  />
                  <span className="custom-radio"></span>
                  範囲選択
                </label>
              </div>
            </div>

            {/* カレンダー年月 */}
            <h2 className="text-xl font-bold text-center text-[#004CA0] mb-2">
              {year}年 {month + 1}月
            </h2>

            <div className="flex justify-between items-center mb-4">
              <button onClick={prevMonth} className="month-btn">
                ◀ 前の月
              </button>
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

          {/* 選択日程 + 区分プルダウン */}
          <div className="schedule-section">
            <h2>選択した日程</h2>
            <ul>
              {selectedDates.map((d, idx) => (
                <li key={idx} className="schedule-card">
                  <span className="schedule-title">{d}</span>
                  <select
                    className="vote-select ml-2"
                    value={dateOptions[d] || "終日"}
                    onChange={(e) => handleOptionChange(d, e.target.value)}
                  >
                    <option value="終日">終日</option>
                    <option value="午前">午前</option>
                    <option value="午後">午後</option>
                    <option value="時刻指定">時刻指定</option>
                  </select>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteDate(d)}
                  >
                    ✖
                  </button>
                </li>
              ))}
            </ul>

            <button onClick={handleIssueUrl} className="save-btn mt-6">
              🔗 共有リンクを発行
            </button>

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
