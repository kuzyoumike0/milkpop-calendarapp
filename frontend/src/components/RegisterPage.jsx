// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import Holidays from "date-holidays";
import "../register.css";
import "../common.css";

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectionMode, setSelectionMode] = useState("multiple");
  const [timeRanges, setTimeRanges] = useState({});
  const [shareLink, setShareLink] = useState("");

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const hd = new Holidays("JP");

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // 日付クリック
  const handleDateClick = (day) => {
    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;

    if (selectionMode === "multiple") {
      if (selectedDates.includes(dateKey)) {
        setSelectedDates(selectedDates.filter((d) => d !== dateKey));
      } else {
        setSelectedDates([...selectedDates, dateKey]);
      }
    } else {
      if (selectedDates.length === 0) {
        setSelectedDates([dateKey]);
      } else if (selectedDates.length === 1) {
        let start = new Date(selectedDates[0]);
        let end = new Date(dateKey);
        if (start > end) [start, end] = [end, start];
        const range = [];
        let d = new Date(start);
        while (d <= end) {
          range.push(
            `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
              2,
              "0"
            )}-${String(d.getDate()).padStart(2, "0")}`
          );
          d.setDate(d.getDate() + 1);
        }
        setSelectedDates(range);
      } else {
        setSelectedDates([dateKey]);
      }
    }
  };

  // 曜日ヘッダー
  const renderWeekdays = () => {
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    return weekdays.map((day, i) => (
      <div
        key={i}
        className={`calendar-weekday ${
          i === 0 ? "holiday" : i === 6 ? "saturday" : ""
        }`}
      >
        {day}
      </div>
    ));
  };

  // 日付セル
  const renderCalendarDays = () => {
    const days = [];
    const holidays = hd.getHolidays(currentYear);

    // 月初の空白
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;
      const dateObj = new Date(currentYear, currentMonth, day);
      const weekday = dateObj.getDay();

      const holiday = holidays.find(
        (h) =>
          h.date ===
          `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(
            day
          ).padStart(2, "0")}`
      );

      let dayClass = "calendar-day";
      if (holiday || weekday === 0) {
        dayClass += " holiday";
      } else if (weekday === 6) {
        dayClass += " saturday";
      }
      if (selectedDates.includes(dateKey)) {
        dayClass += " selected";
      }

      days.push(
        <div
          key={day}
          className={dayClass}
          onClick={() => handleDateClick(day)}
        >
          <div className="day-number">{day}</div>
          {holiday && <div className="holiday-name">{holiday.name}</div>}
        </div>
      );
    }
    return days;
  };

  // 月移動
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // 時間帯変更
  const handleTimeChange = (date, value) => {
    setTimeRanges({ ...timeRanges, [date]: value });
  };

  // 共有リンク発行（DBに保存）
  const generateShareLink = async () => {
    try {
      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          dates: selectedDates.map((d) => ({
            date: d,
            time: timeRanges[d] || "終日",
          })),
        }),
      });

      const data = await response.json();
      if (data.share_token) {
        const url = `${window.location.origin}/share/${data.share_token}`;
        setShareLink(url);
      } else {
        alert("リンク生成に失敗しました");
      }
    } catch (err) {
      console.error(err);
      alert("サーバーエラーが発生しました");
    }
  };

  // コピー
  const copyToClipboard = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      alert("リンクをコピーしました！");
    }
  };

  return (
    <div className="register-page">
      {/* タイトル */}
      <div className="title-input-container">
        <input
          type="text"
          placeholder="日程登録"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="title-input"
        />
      </div>

      {/* 切替 */}
      <div className="selection-toggle">
        <button
          className={selectionMode === "multiple" ? "active" : ""}
          onClick={() => setSelectionMode("multiple")}
        >
          複数選択
        </button>
        <button
          className={selectionMode === "range" ? "active" : ""}
          onClick={() => setSelectionMode("range")}
        >
          範囲選択
        </button>
      </div>

      {/* カレンダー＋右側ボックス */}
      <div className="calendar-container">
        <div className="calendar-box">
          <div className="calendar">
            <div className="calendar-header">
              <button className="month-nav" onClick={handlePrevMonth}>
                ◀
              </button>
              <h2>
                {currentYear}年 {currentMonth + 1}月
              </h2>
              <button className="month-nav" onClick={handleNextMonth}>
                ▶
              </button>
            </div>
            <div className="calendar-weekdays">{renderWeekdays()}</div>
            <div className="calendar-days">{renderCalendarDays()}</div>
          </div>
        </div>

        {/* ← リネーム済み */}
        <div className="common-box">
          <h3>📅 選択した日程</h3>
          {selectedDates.length === 0 ? (
            <p>日付をクリックしてください</p>
          ) : (
            <ul>
              {selectedDates.map((d) => (
                <li key={d}>
                  <span>{d}</span>
                  <select
                    value={timeRanges[d] || "終日"}
                    onChange={(e) => handleTimeChange(d, e.target.value)}
                  >
                    <option value="終日">終日</option>
                    <option value="昼">昼</option>
                    <option value="夜">夜</option>
                    <option value="時刻指定">時刻指定</option>
                  </select>
                </li>
              ))}
            </ul>
          )}
          <div className="share-link-box">
            <button className="share-btn" onClick={generateShareLink}>
              共有リンクを発行
            </button>
            {shareLink && (
              <div className="share-link">
                <a href={shareLink} target="_blank" rel="noopener noreferrer">
                  {shareLink}
                </a>
                <button className="copy-btn" onClick={copyToClipboard}>
                  コピー
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
