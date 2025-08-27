// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Holidays from "date-holidays";
import "../register.css";
import { v4 as uuidv4 } from "uuid";

// 日本の祝日ライブラリ
const hd = new Holidays("JP");

// JST日付 → "YYYY-MM-DD"
const formatDateJST = (date) => {
  const jstDate = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Tokyo" })
  );
  return jstDate.toISOString().split("T")[0];
};

// JSTの今日
const todayStr = formatDateJST(new Date());

const RegisterPage = () => {
  const [mode, setMode] = useState("single");
  const [selectedDates, setSelectedDates] = useState([]);
  const [title, setTitle] = useState("");
  const [responses, setResponses] = useState({});
  const [shareUrl, setShareUrl] = useState("");

  // 日付クリック処理
  const handleDateClick = (date) => {
    const dateStr = formatDateJST(date);
    if (mode === "single") {
      setSelectedDates([dateStr]);
    } else if (mode === "multiple") {
      setSelectedDates((prev) =>
        prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr]
      );
    } else if (mode === "range") {
      if (selectedDates.length === 0) {
        setSelectedDates([dateStr]);
      } else if (selectedDates.length === 1) {
        const start = selectedDates[0];
        const range = getRangeDates(start, dateStr);
        setSelectedDates(range);
      } else {
        setSelectedDates([dateStr]);
      }
    }
  };

  // 範囲モード
  const getRangeDates = (start, end) => {
    const range = [];
    let cur = new Date(start);
    const endDate = new Date(end);
    while (cur <= endDate) {
      range.push(formatDateJST(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return range;
  };

  // タイルクラス
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const classes = [];
      const day = date.getDay();
      if (day === 0) classes.push("sunday");
      if (day === 6) classes.push("saturday");

      const dateStr = formatDateJST(date);
      if (dateStr === todayStr) classes.push("today");
      if (selectedDates.includes(dateStr)) classes.push("selected-date");
      return classes;
    }
    return null;
  };

  // 祝日名を日付下に表示
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const holiday = hd.isHoliday(date);
      if (holiday) {
        return <div className="holiday-name">{holiday.name}</div>;
      }
    }
    return null;
  };

  // 時間区分切替
  const toggleTime = (date, time) => {
    setResponses((prev) => {
      const current = prev[date] || {};
      const updated = {
        ...current,
        [time]: !current[time],
      };
      return { ...prev, [date]: updated };
    });
  };

  // 共有リンク発行
  const handleShare = () => {
    const token = uuidv4();
    const url = `${window.location.origin}/share/${token}`;
    setShareUrl(url);
    console.log("保存データ", { title, selectedDates, responses, token });
  };

  // コピー
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    alert("リンクをコピーしました！");
  };

  return (
    <div className="register-page">
      <h2 className="page-title">日程登録</h2>
      <input
        type="text"
        placeholder="タイトルを入力"
        className="title-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div className="mode-tabs">
        <button
          className={mode === "single" ? "active" : ""}
          onClick={() => setMode("single")}
        >
          単日
        </button>
        <button
          className={mode === "multiple" ? "active" : ""}
          onClick={() => setMode("multiple")}
        >
          複数選択
        </button>
        <button
          className={mode === "range" ? "active" : ""}
          onClick={() => setMode("range")}
        >
          範囲選択
        </button>
      </div>

      <div className="calendar-container">
        <div className="calendar-box">
          <Calendar
            onClickDay={handleDateClick}
            tileClassName={tileClassName}
            tileContent={tileContent}
            locale="ja-JP"
          />
        </div>

        <div className="selected-list">
          <h3>選択中の日程</h3>
          {selectedDates.map((date) => (
            <div key={date} className="selected-card">
              <span className="date-badge">{date}</span>
              <div className="time-buttons">
                {["終日", "昼", "夜", "時間指定"].map((time) => (
                  <button
                    key={time}
                    className={`time-btn ${responses[date]?.[time] ? "active" : ""}`}
                    onClick={() => toggleTime(date, time)}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="save-btn" onClick={handleShare}>
        共有リンクを発行
      </button>

      {shareUrl && (
        <div className="share-link-box">
          <a href={shareUrl} target="_blank" rel="noopener noreferrer">
            {shareUrl}
          </a>
          <button className="copy-btn" onClick={copyToClipboard}>
            コピー
          </button>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
