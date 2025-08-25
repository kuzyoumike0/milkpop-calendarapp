// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import Calendar from "react-calendar";
import Holidays from "date-holidays";
import "../common.css";
import "../register.css";

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [mode, setMode] = useState("multiple"); // "multiple" or "range"
  const [rangeStart, setRangeStart] = useState(null);
  const [shareUrl, setShareUrl] = useState("");

  const hd = new Holidays("JP");

  // 📌 JSTに変換
  const getJSTDate = (date) => {
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    return new Date(utc + 9 * 60 * 60000);
  };

  // 📌 時刻リスト
  const timeOptions = Array.from({ length: 24 }, (_, i) =>
    `${String(i).padStart(2, "0")}:00`
  );

  // 📌 日付クリック処理
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

  // 📌 区分変更
  const handleTimeTypeChange = (index, newType) => {
    const updated = [...selectedDates];
    updated[index].timeType = newType;
    setSelectedDates(updated);
  };

  // 📌 時間指定変更
  const handleTimeChange = (index, key, value) => {
    const updated = [...selectedDates];
    updated[index][key] = value;
    setSelectedDates(updated);
  };

  // 📌 共有リンク生成
  const generateShareLink = () => {
    const token = Math.random().toString(36).substring(2, 10);
    const url = `${window.location.origin}/share/${token}`;
    setShareUrl(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    alert("リンクをコピーしました！");
  };

  return (
    <div className="register-page">
      <h2 className="page-title">日程登録ページ</h2>

      {/* ===== タイトル入力 ===== */}
      <div className="glass-black input-card">
        <input
          type="text"
          placeholder="タイトルを入力してください"
          className="title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="main-content">
        {/* ===== カレンダー（左7割） ===== */}
        <div className="glass-white calendar-card">
          {/* モード切替 */}
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
            calendarType="gregory"   // 月曜始まり
            onClickDay={(date) => handleDateClick(date)}
            value={null}
            tileClassName={({ date }) => {
              const jstDate = getJSTDate(date);
              const today = getJSTDate(new Date());

              const isToday = jstDate.toDateString() === today.toDateString();
              const isSunday = jstDate.getDay() === 0;
              const isSaturday = jstDate.getDay() === 6;
              const holiday = hd.isHoliday(jstDate);

              // 今日を強調
              if (isToday) return "day-today";

              // 選択済み
              if (
                selectedDates.some(
                  (d) => d.date.toDateString() === jstDate.toDateString()
                )
              ) {
                return "selected-date";
              }

              // 日曜・祝日
              if (holiday || isSunday) return "day-sunday";
              // 土曜
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

        {/* ===== リスト（右3割） ===== */}
        <div className="glass-black schedule-box">
          <h3>選択した日程</h3>
          {selectedDates.length === 0 ? (
            <p>日付を選択してください</p>
          ) : (
            <ul>
              {selectedDates.map((d, i) => (
                <li key={i}>
                  <span className="date-label">
                    {d.date.toLocaleDateString("ja-JP")}
                  </span>
                  <select
                    value={d.timeType}
                    onChange={(e) => handleTimeTypeChange(i, e.target.value)}
                    className="time-select"
                  >
                    <option value="終日">終日</option>
                    <option value="昼">昼</option>
                    <option value="夜">夜</option>
                    <option value="時間指定">時間指定</option>
                  </select>

                  {d.timeType === "時間指定" && (
                    <span className="time-range">
                      <select
                        value={d.startTime}
                        onChange={(e) =>
                          handleTimeChange(i, "startTime", e.target.value)
                        }
                        className="time-dropdown"
                      >
                        {timeOptions.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <span> ~ </span>
                      <select
                        value={d.endTime}
                        onChange={(e) =>
                          handleTimeChange(i, "endTime", e.target.value)
                        }
                        className="time-dropdown"
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
