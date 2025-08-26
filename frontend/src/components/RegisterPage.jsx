// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import Calendar from "react-calendar";
import Holidays from "date-holidays";
import "../common.css";
import "../register.css";

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [mode, setMode] = useState("multiple");
  const [rangeStart, setRangeStart] = useState(null);
  const [shareUrl, setShareUrl] = useState("");

  const hd = new Holidays("JP");

  // JST変換
  const getJSTDate = (date) => {
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    return new Date(utc + 9 * 60 * 60000);
  };

  // 時刻リスト
  const timeOptions = Array.from({ length: 24 }, (_, i) =>
    `${String(i).padStart(2, "0")}:00`
  );

  // 日付クリック
  const handleDateClick = (date) => {
    const jstDate = getJSTDate(date);

    if (mode === "range") {
      if (!rangeStart) {
        setRangeStart(jstDate);
      } else {
        const start = rangeStart < jstDate ? rangeStart : jstDate;
        const end = rangeStart < jstDate ? jstDate : rangeStart;
        const newRange = [];
        let current = new Date(start);
        while (current <= end) {
          newRange.push({
            date: new Date(current),
            timeType: "終日",
            startTime: "00:00",
            endTime: "23:59",
          });
          current.setDate(current.getDate() + 1);
        }
        setSelectedDates(newRange);
        setRangeStart(null);
      }
    } else {
      const exists = selectedDates.find(
        (d) => d.date.toDateString() === jstDate.toDateString()
      );
      if (exists) {
        setSelectedDates(
          selectedDates.filter(
            (d) => d.date.toDateString() !== jstDate.toDateString()
          )
        );
      } else {
        setSelectedDates([
          ...selectedDates,
          {
            date: jstDate,
            timeType: "終日",
            startTime: "00:00",
            endTime: "23:59",
          },
        ]);
      }
    }
  };

  // 区分変更
  const handleTimeTypeChange = (index, newType) => {
    const updated = [...selectedDates];
    updated[index].timeType = newType;

    if (newType === "終日") {
      updated[index].startTime = "00:00";
      updated[index].endTime = "23:59";
    } else if (newType === "昼") {
      updated[index].startTime = "09:00";
      updated[index].endTime = "17:59";
    } else if (newType === "夜") {
      updated[index].startTime = "18:00";
      updated[index].endTime = "23:59";
    }
    setSelectedDates(updated);
  };

  // 時間指定変更
  const handleTimeChange = (index, key, value) => {
    const updated = [...selectedDates];
    updated[index][key] = value;
    setSelectedDates(updated);
  };

  // 共有リンク生成
  const generateShareLink = async () => {
    try {
      if (!title || selectedDates.length === 0) {
        alert("タイトルと日程を入力してください");
        return;
      }

      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          dates: selectedDates.map((d) => ({
            date: d.date.toISOString().split("T")[0],
            time: d.timeType,
            startTime: d.startTime,
            endTime: d.endTime,
          })),
          options: {},
        }),
      });

      const data = await res.json();
      if (data.share_token) {
        const url = `${window.location.origin}/share/${data.share_token}`;
        setShareUrl(url);
      } else {
        alert("共有リンクの生成に失敗しました");
      }
    } catch (err) {
      console.error("共有リンク生成エラー", err);
      alert("サーバーエラーが発生しました");
    }
  };

  // コピー
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    alert("リンクをコピーしました！✨");
  };

  return (
    <div className="register-page">
      <h2 className="page-title">日程登録ページ</h2>

      {/* タイトル入力 */}
      <div className="glass-black input-card cute-title-box">
        <input
          type="text"
          placeholder="🎀 タイトルを入力してください 🎀"
          className="title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="main-content">
        {/* カレンダー */}
        <div className="glass-white calendar-card">
          <div className="mode-select">
            <label>
              <input
                type="radio"
                name="mode"
                value="multiple"
                checked={mode === "multiple"}
                onChange={() => {
                  setMode("multiple");
                  setSelectedDates([]);
                  setRangeStart(null);
                }}
              />
              <span>複数選択</span>
            </label>
            <label>
              <input
                type="radio"
                name="mode"
                value="range"
                checked={mode === "range"}
                onChange={() => {
                  setMode("range");
                  setSelectedDates([]);
                  setRangeStart(null);
                }}
              />
              <span>範囲選択</span>
            </label>
          </div>

          <Calendar
            locale="ja-JP"
            calendarType="iso8601"   // ← 正しい指定
            firstDayOfWeek={1}
            formatShortWeekday={(locale, date) =>
              ["日", "月", "火", "水", "木", "金", "土"][date.getDay()]
            }
            onClickDay={(date) => handleDateClick(date)}
            value={null}
            tileClassName={({ date }) => {
              const jstDate = getJSTDate(date);
              const today = getJSTDate(new Date());

              const isToday = jstDate.toDateString() === today.toDateString();
              const isSunday = jstDate.getDay() === 0;
              const isSaturday = jstDate.getDay() === 6;
              const holiday = hd.isHoliday(jstDate);

              if (isToday) return "day-today";
              if (
                selectedDates.some(
                  (d) => d.date.toDateString() === jstDate.toDateString()
                )
              )
                return "selected-date";
              if (holiday || isSunday) return "day-sunday";
              if (isSaturday) return "day-saturday";

              return "day-default";
            }}
            tileContent={({ date }) => {
              const jstDate = getJSTDate(date);
              const holiday = hd.isHoliday(jstDate);
              return holiday ? (
                <span className="holiday-name">{holiday[0].name}</span>
              ) : null;
            }}
          />
        </div>

        {/* リスト */}
        <div className="glass-black schedule-box">
          <h3>選択した日程</h3>
          {selectedDates.length === 0 ? (
            <p>日付を選択してください</p>
          ) : (
            <ul>
              {selectedDates.map((d, i) => (
                <li key={i} className="date-item">
                  <span className="date-label">
                    📅 {d.date.toLocaleDateString("ja-JP")}
                  </span>

                  <div className="time-type-buttons">
                    {["終日", "昼", "夜", "時間指定"].map((type) => (
                      <button
                        key={type}
                        className={`time-type-button ${
                          d.timeType === type ? "active" : ""
                        }`}
                        onClick={() => handleTimeTypeChange(i, type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  {d.timeType === "時間指定" && (
                    <span className="time-range">
                      <select
                        value={d.startTime}
                        onChange={(e) =>
                          handleTimeChange(i, "startTime", e.target.value)
                        }
                        className="time-dropdown stylish-dropdown"
                      >
                        {timeOptions.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <span className="range-tilde"> ~ </span>
                      <select
                        value={d.endTime}
                        onChange={(e) =>
                          handleTimeChange(i, "endTime", e.target.value)
                        }
                        className="time-dropdown stylish-dropdown"
                      >
                        {timeOptions.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}

          <button className="share-button" onClick={generateShareLink}>
            🌸 共有リンクを発行
          </button>
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
