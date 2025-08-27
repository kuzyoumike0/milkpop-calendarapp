import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Holidays from "date-holidays";
import "../register.css";

const hd = new Holidays("JP");

const RegisterPage = () => {
  const [selectedDates, setSelectedDates] = useState([]);
  const [mode, setMode] = useState("single");
  const [title, setTitle] = useState("");
  const [shareLink, setShareLink] = useState("");

  // 日付クリック処理
  const handleDateClick = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    if (mode === "single") {
      setSelectedDates([dateStr]);
    } else if (mode === "multiple") {
      if (selectedDates.includes(dateStr)) {
        setSelectedDates(selectedDates.filter((d) => d !== dateStr));
      } else {
        setSelectedDates([...selectedDates, dateStr]);
      }
    } else if (mode === "range") {
      if (selectedDates.length === 0 || selectedDates.length === 2) {
        setSelectedDates([dateStr]);
      } else if (selectedDates.length === 1) {
        const start = new Date(selectedDates[0]);
        const end = date;
        const range = [];
        let cur = new Date(Math.min(start, end));
        const stop = new Date(Math.max(start, end));
        while (cur <= stop) {
          range.push(cur.toISOString().split("T")[0]);
          cur.setDate(cur.getDate() + 1);
        }
        setSelectedDates(range);
      }
    }
  };

  // カレンダーセルのクラス名
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const classes = [];
      const day = date.getDay();
      if (day === 0) classes.push("sunday");
      if (day === 6) classes.push("saturday");

      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];
      const dateStr = date.toISOString().split("T")[0];

      if (dateStr === todayStr) classes.push("today");
      if (selectedDates.includes(dateStr)) classes.push("selected-date");
      return classes;
    }
    return null;
  };

  // 祝日名だけを追加
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const holiday = hd.isHoliday(date);
      return holiday ? (
        <div className="holiday-name">{holiday[0].name}</div>
      ) : null;
    }
    return null;
  };

  // 共有リンク生成
  const generateShareLink = () => {
    const token = Math.random().toString(36).substring(2, 10);
    const url = `${window.location.origin}/share/${token}`;
    setShareLink(url);
  };

  // リンクコピー
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    alert("コピーしました！");
  };

  return (
    <div className="register-page">
      <h1 className="page-title">日程登録</h1>
      <input
        type="text"
        className="title-input"
        placeholder="タイトルを入力"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* モード切り替え */}
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

      {/* カレンダー */}
      <div className="calendar-container">
        <div className="calendar-box">
          <Calendar
            onClickDay={handleDateClick}
            value={null}
            tileClassName={tileClassName}
            tileContent={tileContent}
          />
        </div>

        {/* 選択中の日程 */}
        <div className="selected-list">
          <h3>選択中の日程</h3>
          {selectedDates.map((d) => (
            <div key={d} className="selected-card">
              <span className="date-badge">{d}</span>
              <div className="time-buttons">
                <button className="time-btn">終日</button>
                <button className="time-btn">午前</button>
                <button className="time-btn">午後</button>
                <button className="time-btn">時間指定</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 共有リンク */}
      <button className="save-btn" onClick={generateShareLink}>
        共有リンクを発行
      </button>
      {shareLink && (
        <div className="share-link-box">
          <a href={shareLink} target="_blank" rel="noopener noreferrer">
            {shareLink}
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
