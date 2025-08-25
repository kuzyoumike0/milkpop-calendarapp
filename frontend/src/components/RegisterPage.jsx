// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import Calendar from "react-calendar";
import "../common.css";
import "../register.css";

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [timeType, setTimeType] = useState("終日");
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");
  const [shareUrl, setShareUrl] = useState("");

  // 📌 カレンダー日付選択（複数 & 範囲対応）
  const handleDateChange = (date) => {
    if (Array.isArray(date)) {
      // 範囲選択
      const [start, end] = date;
      const range = [];
      let current = new Date(start);
      while (current <= end) {
        range.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      setSelectedDates(range);
    } else {
      // 単日選択
      if (selectedDates.some((d) => d.toDateString() === date.toDateString())) {
        setSelectedDates(selectedDates.filter((d) => d.toDateString() !== date.toDateString()));
      } else {
        setSelectedDates([...selectedDates, date]);
      }
    }
  };

  // 📌 時刻リスト生成（1時間ごと）
  const timeOptions = Array.from({ length: 24 }, (_, i) =>
    `${String(i).padStart(2, "0")}:00`
  );

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

      {/* ===== タイトル入力 ===== */}
      <div className="title-input-container">
        <input
          type="text"
          placeholder="タイトルを入力してください"
          className="title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* ===== カレンダー ===== */}
      <div className="calendar-container">
        <Calendar
          onChange={handleDateChange}
          selectRange={true}
          value={selectedDates}
          tileClassName={({ date }) =>
            selectedDates.some((d) => d.toDateString() === date.toDateString())
              ? "selected-date"
              : ""
          }
        />
      </div>

      {/* ===== 選択した日程一覧 ===== */}
      <div className="selected-dates">
        <h3>選択した日程</h3>
        {selectedDates.length === 0 ? (
          <p>日付を選択してください</p>
        ) : (
          <ul>
            {selectedDates.map((d, i) => (
              <li key={i}>
                {d.toLocaleDateString()}{" "}
                {timeType === "時間指定"
                  ? `(${startTime} ~ ${endTime})`
                  : `(${timeType})`}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ===== 時間帯選択 ===== */}
      <div className="time-selection">
        <h3>時間帯を選択</h3>
        <label>
          <input
            type="radio"
            value="終日"
            checked={timeType === "終日"}
            onChange={(e) => setTimeType(e.target.value)}
          />
          終日
        </label>
        <label>
          <input
            type="radio"
            value="昼"
            checked={timeType === "昼"}
            onChange={(e) => setTimeType(e.target.value)}
          />
          昼
        </label>
        <label>
          <input
            type="radio"
            value="夜"
            checked={timeType === "夜"}
            onChange={(e) => setTimeType(e.target.value)}
          />
          夜
        </label>
        <label>
          <input
            type="radio"
            value="時間指定"
            checked={timeType === "時間指定"}
            onChange={(e) => setTimeType(e.target.value)}
          />
          時間指定
        </label>

        {timeType === "時間指定" && (
          <div className="time-range">
            <select value={startTime} onChange={(e) => setStartTime(e.target.value)}>
              {timeOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <span> ~ </span>
            <select value={endTime} onChange={(e) => setEndTime(e.target.value)}>
              {timeOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ===== 共有リンク発行 ===== */}
      <div className="share-link-container">
        <button className="share-button" onClick={generateShareLink}>
          📤 共有リンクを発行
        </button>
        {shareUrl && (
          <div className="share-link-box">
            <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="share-link">
              {shareUrl}
            </a>
            <button className="copy-button" onClick={copyToClipboard}>
              📋 コピー
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
