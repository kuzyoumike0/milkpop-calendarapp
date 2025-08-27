import React, { useState } from "react";
import Calendar from "react-calendar";
import Holidays from "date-holidays";
import "react-calendar/dist/Calendar.css";
import "../register.css";

// 日本時間の今日を取得する関数
const getTodayJST = () => {
  const now = new Date();
  const jstOffset = 9 * 60; // 日本はUTC+9時間
  const localOffset = now.getTimezoneOffset(); // 分単位
  const diff = jstOffset + localOffset;
  const jst = new Date(now.getTime() + diff * 60 * 1000);
  return jst;
};

const RegisterPage = () => {
  const [mode, setMode] = useState("range"); // 単日/複数/範囲
  const [selectedDates, setSelectedDates] = useState([]);
  const [title, setTitle] = useState("");
  const hd = new Holidays("JP");

  // 日本時間の今日
  const today = getTodayJST();

  // 日付クリック処理
  const handleDateChange = (date) => {
    if (mode === "single") {
      setSelectedDates([date]);
    } else if (mode === "multiple") {
      setSelectedDates((prev) => {
        const exists = prev.find((d) => d.toDateString() === date.toDateString());
        if (exists) {
          return prev.filter((d) => d.toDateString() !== date.toDateString());
        }
        return [...prev, date];
      });
    } else if (mode === "range") {
      if (selectedDates.length === 0 || selectedDates.length === 2) {
        setSelectedDates([date]);
      } else if (selectedDates.length === 1) {
        const start = selectedDates[0];
        const range = [];
        const min = start < date ? start : date;
        const max = start > date ? start : date;
        let cur = new Date(min);
        while (cur <= max) {
          range.push(new Date(cur));
          cur.setDate(cur.getDate() + 1);
        }
        setSelectedDates(range);
      }
    }
  };

  const isSelected = (date) =>
    selectedDates.some((d) => d.toDateString() === date.toDateString());

  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const holiday = hd.isHoliday(date);
      if (holiday) {
        return (
          <p style={{ fontSize: "0.6em", color: "red" }}>{holiday[0].name}</p>
        );
      }
    }
  };

  return (
    <div className="register-container">
      <h1 className="banner">MilkPOP Calendar</h1>

      <input
        type="text"
        placeholder="タイトルを入力"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="title-input"
      />

      <div className="mode-buttons">
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

      <div className="calendar-list">
        <div className="calendar-container">
          <Calendar
            locale="ja-JP"
            calendarType="US"
            tileContent={tileContent}
            onClickDay={handleDateChange}
            tileClassName={({ date }) => {
              let classes = "";
              // 今日をJST基準で強調
              if (
                date.getFullYear() === today.getFullYear() &&
                date.getMonth() === today.getMonth() &&
                date.getDate() === today.getDate()
              ) {
                classes += " today";
              }
              // 選択日
              if (isSelected(date)) {
                classes += " selected";
              }
              // 土曜青
              if (date.getDay() === 6) {
                classes += " saturday";
              }
              // 日曜赤
              if (date.getDay() === 0) {
                classes += " sunday";
              }
              return classes;
            }}
          />
        </div>

        <div className="list-container">
          <h2>選択中の日程</h2>
          {selectedDates.map((d, idx) => (
            <div key={idx} className="selected-item">
              <strong>
                {d.getFullYear()}-
                {String(d.getMonth() + 1).padStart(2, "0")}-
                {String(d.getDate()).padStart(2, "0")}
              </strong>
              <div className="time-options">
                <button>終日</button>
                <button>昼</button>
                <button>夜</button>
                <button>時間指定</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
