// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import Calendar from "react-calendar";
import Holidays from "date-holidays";
import "../common.css";
import "../register.css";

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [shareUrl, setShareUrl] = useState("");

  // 📌 日本の祝日設定
  const hd = new Holidays("JP");

  // 📌 時刻リスト生成（1時間ごと）
  const timeOptions = Array.from({ length: 24 }, (_, i) =>
    `${String(i).padStart(2, "0")}:00`
  );

  // 📌 日付選択処理
  const handleDateChange = (date) => {
    if (Array.isArray(date)) {
      // 範囲選択
      const [start, end] = date;
      const range = [];
      let current = new Date(start);
      while (current <= end) {
        range.push({
          date: new Date(current),
          timeType: "終日",
          startTime: "00:00",
          endTime: "23:59",
        });
        current.setDate(current.getDate() + 1);
      }
      setSelectedDates(range);
    } else {
      // 単日
      const exists = selectedDates.find(
        (d) => d.date.toDateString() === date.toDateString()
      );
      if (exists) {
        setSelectedDates(
          selectedDates.filter(
            (d) => d.date.toDateString() !== date.toDateString()
          )
        );
      } else {
        setSelectedDates([
          ...selectedDates,
          {
            date,
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

  // 📌 共有リンク発行
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

      {/* ===== 入力欄カード ===== */}
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
          <Calendar
            onChange={handleDateChange}
            selectRange={true}
            value={selectedDates.map((d) => d.date)}
            tileContent={({ date }) => {
              // 祝日名を表示
              const holiday = hd.isHoliday(date);
              return holiday ? (
                <span className="holiday-name">{holiday[0].name}</span>
              ) : null;
            }}
            tileClassName={({ date }) => {
              const isSunday = date.getDay() === 0;
              const isSaturday = date.getDay() === 6;
              const holiday = hd.isHoliday(date);

              if (
                selectedDates.some(
                  (d) => d.date.toDateString() === date.toDateString()
                )
              ) {
                return "selected-date";
              }
              if (holiday || isSunday) return "holiday";
              if (isSaturday) return "saturday";
              return "";
            }}
          />
        </div>

        {/* ===== サイドの登録済みスケジュールカード（右3割） ===== */}
        <div className="glass-black schedule-box">
          <h3>選択した日程</h3>
          {selectedDates.length === 0 ? (
            <p>日付を選択してください</p>
          ) : (
            <ul>
              {selectedDates.map((d, i) => (
                <li key={i}>
                  <span className="date-label">
                    {d.date.toLocaleDateString()}
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
            📤 共有リンクを発行
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
