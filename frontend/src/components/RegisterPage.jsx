// frontend/src/components/RegisterPage.jsx
import React, { useState, useEffect } from "react";
import "../index.css";
import Holidays from "date-holidays";

const RegisterPage = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDates, setSelectedDates] = useState([]);
  const [shareLink, setShareLink] = useState("");
  const hd = new Holidays("JP");

  // 時刻選択肢
  const timeOptions = Array.from({ length: 24 }, (_, i) =>
    `${i.toString().padStart(2, "0")}:00`
  );

  // 月の日数
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // 曜日配列
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

  // 月の開始曜日
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // 日付クリック
  const handleDateClick = (day) => {
    const date = new Date(currentYear, currentMonth, day);

    const exists = selectedDates.find(
      (d) => d.date.toDateString() === date.toDateString()
    );

    if (exists) {
      // クリックした日が既に選択されていたら解除
      setSelectedDates((prev) =>
        prev.filter((d) => d.date.toDateString() !== date.toDateString())
      );
    } else {
      // 新規追加
      setSelectedDates((prev) => [
        ...prev,
        { date, type: "終日", start: "09:00", end: "18:00" },
      ]);
    }
  };

  // プルダウン変更
  const handleTimeChange = (index, key, value) => {
    setSelectedDates((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      )
    );
  };

  // 削除処理（セル解除も含む）
  const handleDelete = (index) => {
    setSelectedDates((prev) => prev.filter((_, i) => i !== index));
  };

  // 共有リンク生成
  const generateShareLink = () => {
    const randomId = Math.random().toString(36).substring(2, 10);
    const newLink = `${window.location.origin}/share/${randomId}`;
    setShareLink(newLink);
  };

  // ソート（日付順）
  const sortedDates = [...selectedDates].sort(
    (a, b) => a.date - b.date
  );

  // 祝日データ
  const getHoliday = (year, month, day) => {
    const list = hd.getHolidays(year);
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    const holiday = list.find((h) => h.date === dateStr);
    return holiday ? holiday.name : null;
  };

  return (
    <div className="calendar-page">
      <div className="calendar-container">
        {/* カレンダーヘッダー */}
        <div className="calendar-header">
          <button
            onClick={() =>
              setCurrentMonth((prev) => {
                if (prev === 0) {
                  setCurrentYear(currentYear - 1);
                  return 11;
                }
                return prev - 1;
              })
            }
          >
            ←
          </button>
          <h2>
            {currentYear}年 {currentMonth + 1}月
          </h2>
          <button
            onClick={() =>
              setCurrentMonth((prev) => {
                if (prev === 11) {
                  setCurrentYear(currentYear + 1);
                  return 0;
                }
                return prev + 1;
              })
            }
          >
            →
          </button>
        </div>

        {/* 曜日 */}
        <div className="calendar-weekdays">
          {weekdays.map((w, i) => (
            <div key={i} className="calendar-weekday">
              {w}
            </div>
          ))}
        </div>

        {/* 日付 */}
        <div className="calendar-grid">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const date = new Date(currentYear, currentMonth, day);
            const isToday =
              date.toDateString() === today.toDateString();
            const isSelected = selectedDates.some(
              (d) => d.date.toDateString() === date.toDateString()
            );
            const holiday = getHoliday(currentYear, currentMonth, day);

            return (
              <div
                key={day}
                className={`calendar-day ${isToday ? "today" : ""} ${
                  isSelected ? "selected" : ""
                } ${holiday ? "holiday" : ""}`}
                onClick={() => handleDateClick(day)}
              >
                {day}
                {holiday && <div className="holiday-label">{holiday}</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* 選択済み日程リスト */}
      <div className="selected-dates-container">
        <h3 className="selected-dates-title">登録した日程</h3>
        {sortedDates.length === 0 ? (
          <p style={{ textAlign: "center" }}>まだ日程が選択されていません</p>
        ) : (
          sortedDates.map((dateObj, index) => (
            <div key={index} className="selected-date-row">
              <span className="selected-date-label">
                {dateObj.date.toLocaleDateString("ja-JP")}
              </span>

              <div>
                <select
                  className="time-select"
                  value={dateObj.type}
                  onChange={(e) =>
                    handleTimeChange(index, "type", e.target.value)
                  }
                >
                  <option value="終日">終日</option>
                  <option value="昼">昼</option>
                  <option value="夜">夜</option>
                  <option value="時刻指定">時刻指定</option>
                </select>

                {dateObj.type === "時刻指定" && (
                  <>
                    <select
                      className="time-range-select"
                      value={dateObj.start}
                      onChange={(e) =>
                        handleTimeChange(index, "start", e.target.value)
                      }
                    >
                      {timeOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <span>～</span>
                    <select
                      className="time-range-select"
                      value={dateObj.end}
                      onChange={(e) =>
                        handleTimeChange(index, "end", e.target.value)
                      }
                    >
                      {timeOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </>
                )}
              </div>

              <button
                className="delete-button"
                onClick={() => handleDelete(index)}
              >
                削除
              </button>
            </div>
          ))
        )}

        {/* 共有リンク */}
        <button
          className="share-link-button"
          onClick={generateShareLink}
        >
          共有リンクを発行
        </button>
        {shareLink && (
          <p style={{ marginTop: "10px", textAlign: "center" }}>
            <a href={shareLink} target="_blank" rel="noopener noreferrer">
              {shareLink}
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
