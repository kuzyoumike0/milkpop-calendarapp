import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Holidays from "date-holidays";
import "../register.css";

const hd = new Holidays("JP");

export default function RegisterPage() {
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [shareUrl, setShareUrl] = useState("");
  const [selectMode, setSelectMode] = useState("single");
  const [rangeStart, setRangeStart] = useState(null);

  // === 日付クリック処理 ===
  const handleDateClick = (date) => {
    const dateStr = date.toISOString().slice(0, 10);

    if (selectMode === "single") {
      setSelectedDates([{ date: dateStr, timeType: "終日" }]);
    } else if (selectMode === "multi") {
      setSelectedDates((prev) => {
        if (prev.find((d) => d.date === dateStr)) return prev;
        return [...prev, { date: dateStr, timeType: "終日" }];
      });
    } else if (selectMode === "range") {
      if (!rangeStart) {
        setRangeStart(date);
      } else {
        const start = rangeStart < date ? rangeStart : date;
        const end = rangeStart < date ? date : rangeStart;
        let rangeDates = [];
        let current = new Date(start);
        while (current <= end) {
          rangeDates.push({
            date: current.toISOString().slice(0, 10),
            timeType: "終日",
          });
          current.setDate(current.getDate() + 1);
        }
        setSelectedDates(rangeDates);
        setRangeStart(null);
      }
    }
  };

  // === 時間帯変更 ===
  const handleTimeTypeChange = (dateStr, type) => {
    setSelectedDates((prev) =>
      prev.map((d) =>
        d.date === dateStr ? { ...d, timeType: type } : d
      )
    );
  };

  // === 時間指定変更 ===
  const handleTimeChange = (dateStr, field, value) => {
    setSelectedDates((prev) =>
      prev.map((d) =>
        d.date === dateStr ? { ...d, [field]: value } : d
      )
    );
  };

  // === 日付削除 ===
  const handleDeleteDate = (dateStr) => {
    setSelectedDates((prev) => prev.filter((d) => d.date !== dateStr));
  };

  // === 共有リンク発行 ===
  const handleShare = async () => {
    const res = await fetch("/api/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        dates: selectedDates,
      }),
    });
    const data = await res.json();
    setShareUrl(`${window.location.origin}/share/${data.share_token}`);
  };

  // === 日付フォーマット ===
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  };

  // === 曜日・祝日カラー ===
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const holiday = hd.isHoliday(date);
      if (holiday) {
        return <div className="holiday-name">{holiday[0].name}</div>;
      }
    }
    return null;
  };
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const weekday = date.getDay();
      const holiday = hd.isHoliday(date);
      if (holiday || weekday === 0) return "sunday";
      if (weekday === 6) return "saturday";
      return "weekday";
    }
    return null;
  };

  // === 1時間ごとのドロップダウン ===
  const timeOptions = [];
  for (let i = 0; i < 24; i++) {
    const hour = String(i).padStart(2, "0") + ":00";
    timeOptions.push(hour);
  }

  return (
    <div className="register-page">
      <h1 className="page-title">日程登録</h1>

      {/* タイトル */}
      <input
        type="text"
        className="title-input"
        placeholder="タイトルを入力"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div className="register-container">
        {/* カレンダー */}
        <div className="calendar-box">
          <div className="mode-buttons top">
            <button
              className={selectMode === "single" ? "active" : ""}
              onClick={() => setSelectMode("single")}
            >
              単日
            </button>
            <button
              className={selectMode === "multi" ? "active" : ""}
              onClick={() => setSelectMode("multi")}
            >
              複数選択
            </button>
            <button
              className={selectMode === "range" ? "active" : ""}
              onClick={() => setSelectMode("range")}
            >
              範囲選択
            </button>
          </div>

          <Calendar
            locale="ja-JP"
            onClickDay={handleDateClick}
            tileContent={tileContent}
            tileClassName={tileClassName}
            calendarType="gregory"
          />
        </div>

        {/* 選択中の日程リスト */}
        <div className="register-box">
          <h3>選択中の日程</h3>
          <ul className="event-list">
            {selectedDates.map((d) => (
              <li key={d.date}>
                <div className="event-header">
                  <span>{formatDate(d.date)}</span>
                  <button
                    className="delete-day-btn"
                    onClick={() => handleDeleteDate(d.date)}
                  >
                    ×
                  </button>
                </div>

                <div className="time-type-buttons">
                  {["終日", "昼", "夜", "時間指定"].map((t) => (
                    <button
                      key={t}
                      className={d.timeType === t ? "active" : ""}
                      onClick={() => handleTimeTypeChange(d.date, t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                {d.timeType === "時間指定" && (
                  <div className="time-dropdowns">
                    <select
                      value={d.startTime || ""}
                      onChange={(e) =>
                        handleTimeChange(d.date, "startTime", e.target.value)
                      }
                    >
                      <option value="">開始時間</option>
                      {timeOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <span>〜</span>
                    <select
                      value={d.endTime || ""}
                      onChange={(e) =>
                        handleTimeChange(d.date, "endTime", e.target.value)
                      }
                    >
                      <option value="">終了時間</option>
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

          {/* 共有リンク */}
          <button className="share-btn" onClick={handleShare}>
            共有リンク発行
          </button>
          {shareUrl && (
            <div className="share-link">
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="share-link-url"
              >
                {shareUrl}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
