// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Holidays from "date-holidays";
import "../register.css";

const hd = new Holidays("JP");

// JST 今日
const todayJST = new Date(
  new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" })
);

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState("single");
  const [selectedDates, setSelectedDates] = useState([]);
  const [shareUrl, setShareUrl] = useState("");

  const handleDateChange = (date) => {
    if (mode === "single") {
      setSelectedDates([date]);
    } else if (mode === "multi") {
      const exists = selectedDates.some(
        (d) => d.toDateString() === date.toDateString()
      );
      if (exists) {
        setSelectedDates(selectedDates.filter(
          (d) => d.toDateString() !== date.toDateString()
        ));
      } else {
        setSelectedDates([...selectedDates, date]);
      }
    } else if (mode === "range") {
      if (selectedDates.length === 0 || selectedDates.length === 2) {
        setSelectedDates([date]);
      } else if (selectedDates.length === 1) {
        const [start] = selectedDates;
        if (date < start) {
          setSelectedDates([date, start]);
        } else {
          setSelectedDates([start, date]);
        }
      }
    }
  };

  const isSelected = (date) => {
    if (mode === "single" || mode === "multi") {
      return selectedDates.some((d) => d.toDateString() === date.toDateString());
    }
    if (mode === "range" && selectedDates.length === 2) {
      const [start, end] = selectedDates;
      return date >= start && date <= end;
    }
    return false;
  };

  // 共有リンク生成
  const generateShareLink = () => {
    const token = Math.random().toString(36).substring(2, 10);
    const url = `${window.location.origin}/share/${token}`;
    setShareUrl(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    alert("リンクをコピーしました！");
  };

  // 📌 カレンダータイルの描画（祝日名のみ追加）
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const holiday = hd.isHoliday(date);
      return (
        <>
          {holiday && <div className="holiday-name">{holiday[0].name}</div>}
        </>
      );
    }
    return null;
  };

  // 📌 タイルにクラスを付与（日曜赤 / 土曜青 / 祝日赤 / 今日 / 選択日）
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const holiday = hd.isHoliday(date);
      const isSunday = date.getDay() === 0;
      const isSaturday = date.getDay() === 6;
      const isToday =
        date.getFullYear() === todayJST.getFullYear() &&
        date.getMonth() === todayJST.getMonth() &&
        date.getDate() === todayJST.getDate();

      return [
        isSunday ? "sunday" : "",
        isSaturday ? "saturday" : "",
        holiday ? "holiday" : "",
        isToday ? "today" : "",
        isSelected(date) ? "selected-date" : "",
      ].join(" ");
    }
    return "";
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

      {/* モード切替 */}
      <div className="mode-tabs">
        <button
          className={mode === "single" ? "active" : ""}
          onClick={() => setMode("single")}
        >
          単日
        </button>
        <button
          className={mode === "multi" ? "active" : ""}
          onClick={() => setMode("multi")}
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
            onClickDay={handleDateChange}
            value={selectedDates}
            tileContent={tileContent}
            tileClassName={tileClassName}
            calendarType="US"
            locale="ja-JP"
          />
        </div>
        <div className="selected-list">
          <h3>選択中の日程</h3>
          {selectedDates.length === 0 && <p>まだ選択されていません</p>}
          {selectedDates.length > 0 && (
            <ul>
              {mode === "range" && selectedDates.length === 2 ? (
                <li>
                  {selectedDates[0].toLocaleDateString()} ~{" "}
                  {selectedDates[1].toLocaleDateString()}
                </li>
              ) : (
                selectedDates.map((d, i) => (
                  <li key={i}>{d.toLocaleDateString()}</li>
                ))
              )}
            </ul>
          )}
        </div>
      </div>

      {/* 共有リンク */}
      <button className="save-btn" onClick={generateShareLink}>
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
