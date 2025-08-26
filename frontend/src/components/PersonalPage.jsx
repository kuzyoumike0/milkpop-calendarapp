// frontend/src/components/PersonalPage.jsx
import React, { useState } from "react";
import Calendar from "react-calendar";
import Holidays from "date-holidays";
import "../common.css";
import "../personal.css";

const PersonalPage = () => {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [mode, setMode] = useState("multiple");
  const [rangeStart, setRangeStart] = useState(null);

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

  // 日付クリック処理
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

  // 区分ボタン切替
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

  return (
    <div className="personal-page">
      <h2 className="page-title">個人スケジュール登録</h2>

      {/* ===== タイトル・メモ入力 ===== */}
      <div className="glass-black input-card cute-title-box">
        <input
          type="text"
          placeholder="📌 タイトルを入力してください"
          className="title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="glass-black input-card memo-box">
        <textarea
          placeholder="📝 メモを入力してください"
          className="memo-input"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </div>

      <div className="main-content">
        {/* ===== カレンダー ===== */}
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
            calendarType="gregory"
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

        {/* ===== リスト ===== */}
        <div className="glass-black schedule-box">
          <h3>登録した日程</h3>
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
        </div>
      </div>
    </div>
  );
};

export default PersonalPage;
