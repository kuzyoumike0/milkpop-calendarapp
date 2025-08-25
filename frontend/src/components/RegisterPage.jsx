// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import Holidays from "date-holidays";
import { v4 as uuidv4 } from "uuid"; // ✅ ランダムID生成
import "../register.css";

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectionMode, setSelectionMode] = useState("multiple");
  const [timeRanges, setTimeRanges] = useState({});
  const [shareUrl, setShareUrl] = useState(""); // ✅ 共有リンク保存用

  const today = new Date();
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
          : [...prev, dateStr].sort()
      );
    } else if (selectionMode === "range") {
      if (selectedDates.length === 0 || selectedDates.length === 2) {
        setSelectedDates([dateStr]);
      } else if (selectedDates.length === 1) {
        const start = new Date(selectedDates[0]);
        const end = new Date(dateStr);
        const range = [];
        const step = start < end ? 1 : -1;

        let d = new Date(start);
        while ((step > 0 && d <= end) || (step < 0 && d >= end)) {
          range.push(d.toISOString().split("T")[0]);
          d.setDate(d.getDate() + step);
        }
        setSelectedDates(range.sort());
      }
    }
  };

  // 時間帯変更
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
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;

      const isSelected = selectedDates.includes(dateStr);
      const isToday = dateStr === today.toISOString().split("T")[0];
      const holidayInfo = hd.isHoliday(new Date(currentYear, currentMonth, day));

      days.push(
        <div
          key={day}
          className={`calendar-day ${isSelected ? "selected" : ""} ${
            isToday ? "today" : ""
          }`}
          onClick={() => handleDateClick(day)}
        >
          <span className="day-number">{day}</span>
          {holidayInfo && (
            <span className="holiday-name">{holidayInfo[0].name}</span>
          )}
          {isToday && <span className="today-label">今日</span>}
        </div>
      );
    }
    return days;
  };

  // 時刻プルダウン
  const timeOptions = [];
  for (let h = 0; h < 24; h++) {
    const label = `${String(h).padStart(2, "0")}:00`;
    timeOptions.push(label);
  }

  // ✅ 共有リンク発行処理
  const generateShareLink = () => {
    const token = uuidv4(); // ランダムなトークン発行
    const url = `${window.location.origin}/share/${token}`;

    // ローカル保存してSharePageで使えるようにする
    localStorage.setItem(
      `schedule_${token}`,
      JSON.stringify({
        title,
        schedules: selectedDates.map((d) => ({
          date: d,
          time: timeRanges[d]?.type || "終日",
        })),
      })
    );

    setShareUrl(url);
  };

  // ✅ クリップボードコピー
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert("URLをコピーしました");
    });
  };

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
          className={`mode-option ${selectionMode === "range" ? "active" : ""}`}
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
              <li key={d}>
                <div>{d}</div>
                <select
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

          {/* 共有リンク発行ボタン */}
          <button className="share-button" onClick={generateShareLink}>
            共有リンクを発行
          </button>

          {/* ✅ 発行されたリンク表示 */}
          {shareUrl && (
            <div className="share-link-box">
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="share-link"
              >
                {shareUrl}
              </a>
              <button className="copy-button" onClick={copyToClipboard}>
                📋 コピー
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
