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
  const [selectMode, setSelectMode] = useState("single");
  const [timeOptions, setTimeOptions] = useState({}); // 各日付の時間帯設定
  const [shareUrl, setShareUrl] = useState("");

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  // ===== 日付クリック =====
  const handleDateClick = (date) => {
    if (selectMode === "single") {
      if (selectedDates.includes(date)) {
        setSelectedDates(selectedDates.filter((d) => d !== date));
      } else {
        setSelectedDates([...selectedDates, date]);
      }
    } else if (selectMode === "range") {
      if (selectedDates.length === 0) {
        setSelectedDates([date]);
      } else if (selectedDates.length === 1) {
        const start = Math.min(selectedDates[0], date);
        const end = Math.max(selectedDates[0], date);
        const range = [];
        for (let d = start; d <= end; d++) range.push(d);
        setSelectedDates(range);
      } else {
        setSelectedDates([date]);
      }
    }
  };

  // ===== 選択解除 =====
  const handleRemoveSelected = (date) => {
    setSelectedDates(selectedDates.filter((d) => d !== date));
    setTimeOptions((prev) => {
      const newOptions = { ...prev };
      delete newOptions[date];
      return newOptions;
    });
  };

  // ===== 月切替 =====
  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  // ===== 時間帯変更 =====
  const handleTimeChange = (date, type, value) => {
    setTimeOptions((prev) => ({
      ...prev,
      [date]: {
        ...prev[date],
        [type]: value,
      },
    }));
  };

  // ===== 共有リンク生成 =====
  const handleGenerateLink = () => {
    if (!title || selectedDates.length === 0) {
      alert("タイトルと日程を入力してください！");
      return;
    }
    // 仮でランダムUUIDを生成
    const uuid = Math.random().toString(36).substring(2, 10);
    const url = `https://milkpop.app/share/${uuid}`;
    setShareUrl(url);
    alert("共有リンクを生成しました！");
  };

  // ===== 時刻リスト =====
  const hours = Array.from({ length: 24 }, (_, i) => `${i}時`);

  const sortedSelectedDates = [...selectedDates].sort((a, b) => a - b);

  return (
    <>
      <Header />

      <main className="register-page">
        {/* ===== タイトル入力 ===== */}
        <div className="form-top">
          <div className="form-group short-input left-input">
            <label>タイトル</label>
            <input
              type="text"
              value={title}
              placeholder="予定タイトルを入力"
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
        </div>

        <div className="register-layout">
          {/* ===== カレンダーエリア ===== */}
          <div className="calendar-section">
            {/* 選択モードラジオをカレンダー上に配置 */}
            <div className="radio-group mb-3">
              <div className="radio-options">
                <label className="radio-label">
                  <input
                    type="radio"
                    value="single"
                    checked={selectMode === "single"}
                    onChange={(e) => setSelectMode(e.target.value)}
                  />
                  <span className="custom-radio"></span> 複数選択
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    value="range"
                    checked={selectMode === "range"}
                    onChange={(e) => setSelectMode(e.target.value)}
                  />
                  <span className="custom-radio"></span> 範囲選択
                </label>
              </div>
            </div>

            <h2 className="form-title">
              {year}年 {month + 1}月
            </h2>
            <div className="calendar-nav">
              <button onClick={prevMonth} className="nav-btn">← 前の月</button>
              <button onClick={nextMonth} className="nav-btn">次の月 →</button>
            </div>

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
          </div>

          {/* ===== 選択中日程リスト ===== */}
          <div className="schedule-section">
            {sortedSelectedDates.length > 0 && (
              <div className="card selected-dates mb-4">
                <h2 className="form-title">選択中の日程</h2>
                <ul>
                  {sortedSelectedDates.map((d, i) => {
                    const option = timeOptions[d] || { period: "終日" };
                    return (
                      <li key={i} className="schedule-card">
                        <span className="date-tag">
                          {month + 1}/{d}
                        </span>

                        {/* 時間帯プルダウン */}
                        <select
                          value={option.period}
                          onChange={(e) =>
                            handleTimeChange(d, "period", e.target.value)
                          }
                        >
                          <option value="終日">終日</option>
                          <option value="午前">午前</option>
                          <option value="午後">午後</option>
                          <option value="時刻指定">時刻指定</option>
                        </select>

                        {/* 時刻指定された場合に追加プルダウン */}
                        {option.period === "時刻指定" && (
                          <>
                            <select
                              value={option.start || ""}
                              onChange={(e) =>
                                handleTimeChange(d, "start", e.target.value)
                              }
                            >
                              <option value="">開始時刻</option>
                              {hours.map((h, idx) => (
                                <option
                                  key={idx}
                                  value={h}
                                  disabled={
                                    option.end &&
                                    idx >= hours.indexOf(option.end)
                                  }
                                >
                                  {h}
                                </option>
                              ))}
                            </select>
                            <select
                              value={option.end || ""}
                              onChange={(e) =>
                                handleTimeChange(d, "end", e.target.value)
                              }
                            >
                              <option value="">終了時刻</option>
                              {hours.map((h, idx) => (
                                <option
                                  key={idx}
                                  value={h}
                                  disabled={
                                    option.start &&
                                    idx <= hours.indexOf(option.start)
                                  }
                                >
                                  {h}
                                </option>
                              ))}
                            </select>
                          </>
                        )}

                        <button
                          className="delete-btn-small"
                          onClick={() => handleRemoveSelected(d)}
                        >
                          ×
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* 共有リンク生成ボタン */}
            <button className="save-btn mt-4" onClick={handleGenerateLink}>
              共有リンクを発行する
            </button>
            {shareUrl && (
              <p className="mt-2">
                共有URL: <a href={shareUrl}>{shareUrl}</a>
              </p>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default RegisterPage;
