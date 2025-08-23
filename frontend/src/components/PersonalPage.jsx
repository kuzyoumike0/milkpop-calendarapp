import React, { useState } from "react";
import "../index.css";
import Header from "./Header";
import Footer from "./Footer";

const daysOfWeek = ["日", "月", "火", "水", "木", "金", "土"];
const timeOptions = Array.from({ length: 24 }, (_, i) => `${i}:00`);

const PersonalPage = () => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState([]);
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [selectionMode, setSelectionMode] = useState("multiple");
  const [rangeStart, setRangeStart] = useState(null);

  // 時間帯
  const [timeType, setTimeType] = useState("終日");
  const [startTime, setStartTime] = useState("9:00");
  const [endTime, setEndTime] = useState("18:00");

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

    if (selectionMode === "single") {
      setSelectedDates([dateStr]);
    } else if (selectionMode === "multiple") {
      if (selectedDates.includes(dateStr)) {
        setSelectedDates(selectedDates.filter((d) => d !== dateStr));
      } else {
        setSelectedDates([...selectedDates, dateStr]);
      }
    } else if (selectionMode === "range") {
      if (!rangeStart) {
        setRangeStart(dateStr);
        setSelectedDates([dateStr]);
      } else {
        let start = new Date(rangeStart);
        let end = new Date(dateStr);
        if (start > end) [start, end] = [end, start];

        const range = [];
        const cursor = new Date(start);
        while (cursor <= end) {
          const d = `${cursor.getFullYear()}-${String(
            cursor.getMonth() + 1
          ).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
          range.push(d);
          cursor.setDate(cursor.getDate() + 1);
        }
        setSelectedDates(range);
        setRangeStart(null);
      }
    }
  };

  // === 選択解除 ===
  const handleDeleteDate = (dateStr) => {
    setSelectedDates(selectedDates.filter((d) => d !== dateStr));
  };

  // === 保存 ===
  const handleSave = async () => {
    try {
      for (const d of selectedDates) {
        const res = await fetch("/api/personal-schedules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            memo,
            date: d,
            selectionMode,
            timeType,
            startTime: timeType === "時刻指定" ? startTime : null,
            endTime: timeType === "時刻指定" ? endTime : null,
          }),
        });
        await res.json();
      }
      alert("✅ 個人スケジュールを保存しました");
      setSelectedDates([]);
      setTitle("");
      setMemo("");
    } catch (err) {
      console.error(err);
      alert("❌ 保存に失敗しました");
    }
  };

  // === カレンダーセル生成 ===
  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} className="calendar-cell empty"></div>);
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
          {/* 左：入力フォーム + カレンダー */}
          <div className="calendar-section">
            {/* タイトル */}
            <div className="mb-6 text-left">
              <label className="block text-[#004CA0] font-bold mb-2 text-lg">
                📌 タイトル
              </label>
              <input
                type="text"
                placeholder="例: 出張予定"
                className="input-field"
                value={title}
                onChange={(e) => setTitle(e.target.value.replace(/_/g, ""))}
              />
            </div>

            {/* メモ */}
            <div className="mb-6 text-left">
              <label className="block text-[#004CA0] font-bold mb-2 text-lg">
                🗒 メモ
              </label>
              <textarea
                placeholder="詳細を入力してください"
                className="input-field"
                rows="4"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </div>

            {/* 選択モード */}
            <div className="mb-4 text-left">
              <label className="block text-[#004CA0] font-bold mb-2 text-lg">
                🔽 選択モード
              </label>
              <select
                className="input-field"
                value={selectionMode}
                onChange={(e) => setSelectionMode(e.target.value)}
              >
                <option value="single">単日選択</option>
                <option value="multiple">複数選択</option>
                <option value="range">範囲選択</option>
              </select>
            </div>

            {/* 時間帯 */}
            <div className="mb-6 text-left">
              <label className="block text-[#004CA0] font-bold mb-2 text-lg">
                ⏰ 時間帯
              </label>
              <select
                className="input-field"
                value={timeType}
                onChange={(e) => setTimeType(e.target.value)}
              >
                <option value="終日">終日</option>
                <option value="午前">午前</option>
                <option value="午後">午後</option>
                <option value="時刻指定">時刻指定</option>
              </select>

              {timeType === "時刻指定" && (
                <div className="flex gap-4 mt-3">
                  <select
                    className="input-field flex-1"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  >
                    {timeOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <span className="self-center">〜</span>
                  <select
                    className="input-field flex-1"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  >
                    {timeOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* カレンダー年月 */}
            <h2 className="text-xl font-bold text-center text-[#004CA0] mb-2">
              {year}年 {month + 1}月
            </h2>

            {/* 月切替 */}
            <div className="flex justify-between items-center mb-4">
              <button onClick={prevMonth} className="month-btn">
                ◀ 前の月
              </button>
              <button onClick={nextMonth} className="month-btn">
                次の月 ▶
              </button>
            </div>

            {/* カレンダー */}
            <div className="custom-calendar">
              {daysOfWeek.map((d, idx) => (
                <div key={idx} className="calendar-day-header">
                  {d}
                </div>
              ))}
              {cells}
            </div>
          </div>

          {/* 右：選択済み */}
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

            {/* 保存ボタン */}
            <button onClick={handleSave} className="save-btn mt-6">
              💾 保存する
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default PersonalPage;
