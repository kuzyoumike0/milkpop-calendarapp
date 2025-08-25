// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import Calendar from "react-calendar";
import Holidays from "date-holidays"; // 📌 祝日ライブラリ
import "../common.css";
import "../register.css";

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [timeType, setTimeType] = useState("終日");
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");
  const [shareUrl, setShareUrl] = useState("");

  // 📌 日本の祝日設定
  const hd = new Holidays("JP");

  // 📌 日付選択
  const handleDateChange = (date) => {
    if (Array.isArray(date)) {
      const [start, end] = date;
      const range = [];
      let current = new Date(start);
      while (current <= end) {
        range.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      setSelectedDates(range);
    } else {
      if (selectedDates.some((d) => d.toDateString() === date.toDateString())) {
        setSelectedDates(
          selectedDates.filter((d) => d.toDateString() !== date.toDateString())
        );
      } else {
        setSelectedDates([...selectedDates, date]);
      }
    }
  };

  const timeOptions = Array.from({ length: 24 }, (_, i) =>
    `${String(i).padStart(2, "0")}:00`
  );

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

      <div className="main-content">
        {/* ===== カレンダー（7割） ===== */}
        <div className="glass-white calendar-card">
          <Calendar
            onChange={handleDateChange}
            selectRange={true}
            value={selectedDates}
            tileContent={({ date }) => {
              // 📌 祝日名を表示
              const holiday = hd.isHoliday(date);
              return holiday ? (
                <span className="holiday-name">{holiday[0].name}</span>
              ) : null;
            }}
            tileClassName={({ date }) => {
              const isSunday = date.getDay() === 0;
              const isSaturday = date.getDay() === 6;
              const holiday = hd.isHoliday(date);

              if (holiday || isSunday) return "holiday";
              if (isSaturday) return "saturday";
              return "";
            }}
          />
        </div>

        {/* ===== 選択リスト（3割） ===== */}
        <div className="glass-black schedule-box">
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

          <h3>時間帯を選択</h3>
          <div className="time-selection">
            <label><input type="radio" value="終日" checked={timeType==="終日"} onChange={(e)=>setTimeType(e.target.value)}/> 終日</label>
            <label><input type="radio" value="昼" checked={timeType==="昼"} onChange={(e)=>setTimeType(e.target.value)}/> 昼</label>
            <label><input type="radio" value="夜" checked={timeType==="夜"} onChange={(e)=>setTimeType(e.target.value)}/> 夜</label>
            <label><input type="radio" value="時間指定" checked={timeType==="時間指定"} onChange={(e)=>setTimeType(e.target.value)}/> 時間指定</label>
          </div>

          {timeType === "時間指定" && (
            <div className="time-range">
              <select value={startTime} onChange={(e) => setStartTime(e.target.value)}>
                {timeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <span> ~ </span>
              <select value={endTime} onChange={(e) => setEndTime(e.target.value)}>
                {timeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          )}

          <button className="share-button" onClick={generateShareLink}>
            📤 共有リンクを発行
          </button>
          {shareUrl && (
            <div className="share-link-box">
              <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="share-link">
                {shareUrl}
              </a>
              <button className="copy-button" onClick={copyToClipboard}>📋 コピー</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
