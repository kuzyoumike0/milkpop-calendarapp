// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import Holidays from "date-holidays";
import "../register.css";

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectionMode, setSelectionMode] = useState("multiple");
  const [timeRanges, setTimeRanges] = useState({});

  const [rangeStart, setRangeStart] = useState(null); // 範囲選択の開始日
  const [hoverDate, setHoverDate] = useState(null);   // 範囲選択中のマウスホバー日

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const hd = new Holidays("JP");

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // 日付クリック処理
  const handleDateClick = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;

    if (selectionMode === "multiple") {
      setSelectedDates((prev) =>
        prev.includes(dateStr)
          ? prev.filter((d) => d !== dateStr)
          : [...prev, dateStr]
      );
    } else if (selectionMode === "range") {
      if (!rangeStart) {
        // 1回目クリック → 開始日設定
        setRangeStart(dateStr);
        setSelectedDates([dateStr]);
      } else {
        // 2回目クリック → 範囲確定
        const start = new Date(rangeStart);
        const end = new Date(dateStr);
        const range = [];
        const step = start < end ? 1 : -1;

        for (let d = new Date(start); ; d.setDate(d.getDate() + step)) {
          range.push(d.toISOString().split("T")[0]);
          if (
            (step > 0 && d.getTime() >= end.getTime()) ||
            (step < 0 && d.getTime() <= end.getTime())
          ) {
            break; // ✅ 終了日でループを終了 → 翌日まで入らない
          }
        }

        // ✅ 全範囲を右リストへ反映
        setSelectedDates(range);
        setRangeStart(null);
        setHoverDate(null);
      }
    }
  };

  // 時間帯変更処理
  const handleTimeChange = (date, field, value) => {
    setTimeRanges((prev) => ({
      ...prev,
      [date]: {
        ...prev[date],
        [field]: value,
      },
    }));
  };

  // カレンダー描画
  const renderCalendar = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(currentYear, currentMonth, day);
      const dateStr = dateObj.toISOString().split("T")[0];

      const isSelected = selectedDates.includes(dateStr);
      const holiday = hd.isHoliday(dateObj);
      const isToday = dateStr === todayStr;

      // 範囲選択中の仮ハイライト
      let inRange = false;
      if (rangeStart && hoverDate) {
        const start = new Date(rangeStart);
        const end = new Date(hoverDate);
        if (start <= end) {
          inRange = dateObj >= start && dateObj <= end;
        } else {
          inRange = dateObj <= start && dateObj >= end;
        }
      }

      days.push(
        <div
          key={day}
          className={`calendar-day 
            ${isSelected ? "selected" : ""} 
            ${holiday ? "holiday" : ""} 
            ${isToday ? "today" : ""} 
            ${inRange ? "in-range" : ""}`}
          onClick={() => handleDateClick(day)}
          onMouseEnter={() => rangeStart && setHoverDate(dateStr)}
        >
          <div className="day-number">{day}</div>
          {holiday && <div className="holiday-name">{holiday[0].name}</div>}
        </div>
      );
    }
    return days;
  };

  // 時刻選択用の選択肢
  const timeOptions = [];
  for (let h = 0; h < 24; h++) {
    const label = `${String(h).padStart(2, "0")}:00`;
    timeOptions.push(label);
  }

  return (
    <div className="register-page">
      <h2>日程登録</h2>

      {/* タイトル */}
      <div className="calendar-title-input">
        <input
          type="text"
          placeholder="タイトルを入力"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* 選択モード */}
      <div className="selection-mode">
        <label
          className={`mode-option ${
            selectionMode === "multiple" ? "active" : ""
          }`}
        >
          <input
            type="radio"
            value="multiple"
            checked={selectionMode === "multiple"}
            onChange={() => setSelectionMode("multiple")}
          />
          複数選択
        </label>
        <label
          className={`mode-option ${
            selectionMode === "range" ? "active" : ""
          }`}
        >
          <input
            type="radio"
            value="range"
            checked={selectionMode === "range"}
            onChange={() => setSelectionMode("range")}
          />
          範囲選択
        </label>
      </div>

      {/* カレンダーとリストを横並び */}
      <div className="calendar-layout">
        <div className="calendar">
          <div className="calendar-header">
            <button onClick={() => setCurrentMonth((m) => m - 1)}>◀</button>
            <span>
              {currentYear}年 {currentMonth + 1}月
            </span>
            <button onClick={() => setCurrentMonth((m) => m + 1)}>▶</button>
          </div>
          <div className="calendar-grid">{renderCalendar()}</div>
        </div>

        {/* 選択日程 + 時間帯 */}
        <div className="selected-list">
          <h3>選択した日程</h3>
          <ul>
            {selectedDates.map((d) => (
              <li key={d} className="selected-item">
                <span className="selected-date">{d}</span>
                <select
                  className="styled-dropdown"
                  value={timeRanges[d]?.type || "終日"}
                  onChange={(e) => handleTimeChange(d, "type", e.target.value)}
                >
                  <option value="終日">終日</option>
                  <option value="昼">昼</option>
                  <option value="夜">夜</option>
                  <option value="時刻">時刻指定</option>
                </select>

                {timeRanges[d]?.type === "時刻" && (
                  <div className="time-range">
                    <select
                      className="styled-dropdown"
                      value={timeRanges[d]?.start || "09:00"}
                      onChange={(e) =>
                        handleTimeChange(d, "start", e.target.value)
                      }
                    >
                      {timeOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    ～
                    <select
                      className="styled-dropdown"
                      value={timeRanges[d]?.end || "18:00"}
                      onChange={(e) =>
                        handleTimeChange(d, "end", e.target.value)
                      }
                    >
                      {timeOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
