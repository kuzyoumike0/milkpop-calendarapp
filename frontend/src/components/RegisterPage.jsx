import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../index.css";

// 日本の祝日を簡易定義（例として2025年の一部）
const holidays = {
  "2025-01-01": "元日",
  "2025-02-11": "建国記念の日",
  "2025-04-29": "昭和の日",
  "2025-05-03": "憲法記念日",
  "2025-05-04": "みどりの日",
  "2025-05-05": "こどもの日",
  "2025-11-03": "文化の日",
  "2025-11-23": "勤労感謝の日",
};

const RegisterPage = () => {
  const [mode, setMode] = useState("range"); // 範囲 or 複数
  const [range, setRange] = useState([null, null]);
  const [multiDates, setMultiDates] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [title, setTitle] = useState("");

  // 現在日付（日本時間）
  const today = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" })
  );

  // カレンダー選択処理
  const handleCalendarClick = (date) => {
    if (mode === "range") {
      if (!range[0]) {
        setRange([date, null]);
        setSelectedDates([date]); // 開始日に色
      } else if (!range[1]) {
        const newRange =
          date > range[0] ? [range[0], date] : [date, range[0]];
        setRange(newRange);

        // 範囲内の日付すべてリストアップ
        const dates = [];
        let cur = new Date(newRange[0]);
        while (cur <= newRange[1]) {
          dates.push(new Date(cur));
          cur.setDate(cur.getDate() + 1);
        }
        setSelectedDates(dates);
      } else {
        setRange([date, null]);
        setSelectedDates([date]);
      }
    } else {
      const exists = multiDates.some(
        (d) => d.toDateString() === date.toDateString()
      );
      let newDates;
      if (exists) {
        newDates = multiDates.filter(
          (d) => d.toDateString() !== date.toDateString()
        );
      } else {
        newDates = [...multiDates, date];
      }
      setMultiDates(newDates);
      setSelectedDates(newDates);
    }
  };

  // 日付タイルのカスタム
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const dateStr = date.toISOString().split("T")[0];

      // 今日
      if (date.toDateString() === today.toDateString()) {
        return "today-highlight";
      }

      // 祝日
      if (holidays[dateStr]) {
        return "holiday-highlight";
      }

      // 選択範囲
      if (
        selectedDates.some((d) => d.toDateString() === date.toDateString())
      ) {
        return "selected-date";
      }
    }
    return null;
  };

  return (
    <div className="page-container">
      <main>
        <h1 className="page-title">日程登録ページ</h1>

        {/* タイトル入力 */}
        <div style={{ marginBottom: "16px" }}>
          <input
            type="text"
            placeholder="イベントタイトルを入力"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="title-input"
          />
        </div>

        {/* モード選択 */}
        <div className="form-group">
          <label>選択モード</label>
          <div className="radio-group horizontal">
            <label
              className={`radio-label ${mode === "range" ? "radio-active" : ""}`}
            >
              <input
                type="radio"
                name="mode"
                value="range"
                checked={mode === "range"}
                onChange={() => {
                  setMode("range");
                  setRange([null, null]);
                  setSelectedDates([]);
                }}
              />
              範囲選択
            </label>
            <label
              className={`radio-label ${mode === "multi" ? "radio-active" : ""}`}
            >
              <input
                type="radio"
                name="mode"
                value="multi"
                checked={mode === "multi"}
                onChange={() => {
                  setMode("multi");
                  setMultiDates([]);
                  setSelectedDates([]);
                }}
              />
              複数選択
            </label>
          </div>
        </div>

        {/* カレンダー */}
        <Calendar
          onClickDay={handleCalendarClick}
          value={mode === "range" ? range : multiDates}
          selectRange={mode === "range"}
          tileClassName={tileClassName}
          className="custom-calendar"
        />

        {/* 選択済みリスト */}
        <div className="schedule-section">
          <h2>選択した日程</h2>
          {selectedDates.length === 0 ? (
            <p>日程が選択されていません</p>
          ) : (
            <ul>
              {selectedDates.map((d, i) => (
                <li key={i}>{d.toLocaleDateString("ja-JP")}</li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;
