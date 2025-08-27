// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import Calendar from "react-calendar";
import Holidays from "date-holidays";
import { v4 as uuidv4 } from "uuid";
import "../common.css";
import "../register.css";

const hd = new Holidays("JP");

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState("single");
  const [selectedDates, setSelectedDates] = useState([]);
  const [rangeStart, setRangeStart] = useState(null);
  const [timeType, setTimeType] = useState("終日");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [schedules, setSchedules] = useState([]);

  // JST現在日付を取得
  const today = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }))
    .toISOString()
    .split("T")[0];

  // ===== 日付クリック =====
  const handleDateClick = (date) => {
    const dateStr = date.toISOString().split("T")[0];

    if (mode === "single") {
      setSelectedDates([dateStr]);
    } else if (mode === "multiple") {
      if (selectedDates.includes(dateStr)) {
        setSelectedDates(selectedDates.filter((d) => d !== dateStr));
      } else {
        setSelectedDates([...selectedDates, dateStr].sort());
      }
    } else if (mode === "range") {
      if (!rangeStart) {
        setRangeStart(dateStr);
        setSelectedDates([dateStr]);
      } else {
        let start = new Date(rangeStart);
        let end = new Date(dateStr);
        if (start > end) [start, end] = [end, start];
        const range = [];
        let d = new Date(start);
        while (d <= end) {
          range.push(d.toISOString().split("T")[0]);
          d.setDate(d.getDate() + 1);
        }
        setSelectedDates(range);
        setRangeStart(null);
      }
    }
  };

  // ===== 保存 =====
  const handleSave = async () => {
    if (!title || selectedDates.length === 0) {
      alert("タイトルと日付を入力してください");
      return;
    }

    const newSchedule = {
      id: uuidv4(),
      title,
      dates: selectedDates.map((d) => ({
        date: d,
        timeType,
        startTime: timeType === "時間指定" ? startTime : null,
        endTime: timeType === "時間指定" ? endTime : null,
      })),
    };

    const res = await fetch("/api/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSchedule),
    });
    if (res.ok) {
      const token = (await res.json()).token;
      setShareUrl(`${window.location.origin}/share/${token}`);
      setSchedules([...schedules, newSchedule]);
      setTitle("");
      setSelectedDates([]);
    }
  };

  // ===== 祝日名 =====
  const getHolidayName = (date) => {
    const h = hd.isHoliday(date);
    return h ? h[0].name : null;
  };

  // ===== 時間指定ドロップダウン =====
  const renderTimeDropdown = () => {
    if (timeType !== "時間指定") return null;
    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    return (
      <div className="time-dropdowns">
        <select value={startTime} onChange={(e) => setStartTime(e.target.value)}>
          <option value="">開始時間</option>
          {hours.map((h) => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>
        <span> ~ </span>
        <select value={endTime} onChange={(e) => setEndTime(e.target.value)}>
          <option value="">終了時間</option>
          {hours.map((h) => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <div className="register-page">
      <h1 className="page-title">日程登録</h1>

      {/* タイトル */}
      <input
        type="text"
        className="title-input"
        placeholder="タイトルを入力"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* 選択モードタブ */}
      <div className="mode-tabs">
        <button className={mode === "single" ? "active" : ""} onClick={() => setMode("single")}>単日</button>
        <button className={mode === "multiple" ? "active" : ""} onClick={() => setMode("multiple")}>複数選択</button>
        <button className={mode === "range" ? "active" : ""} onClick={() => setMode("range")}>範囲選択</button>
      </div>

      {/* カレンダーとリスト */}
      <div className="calendar-container">
        <div className="calendar-box">
          <Calendar
            locale="ja-JP"
            calendarType="US"
            onClickDay={handleDateClick}
            tileContent={({ date }) => {
              const holiday = getHolidayName(date);
              return holiday ? <p className="holiday-name">{holiday}</p> : null;
            }}
            tileClassName={({ date }) => {
              const dateStr = date.toISOString().split("T")[0];
              if (selectedDates.includes(dateStr)) return "selected-date";
              if (dateStr === today) return "today"; // 当日
              if (getHolidayName(date)) return "holiday"; // 祝日
              if (date.getDay() === 0) return "sunday"; // 日曜
              if (date.getDay() === 6) return "saturday"; // 土曜
              return null;
            }}
          />
        </div>

        <div className="selected-list">
          <h3>選択中の日程</h3>
          {selectedDates.map((d) => (
            <div key={d} className="selected-item">
              <span>{d}</span>
              <div className="time-options">
                <label><input type="radio" name={`time-${d}`} value="終日" checked={timeType === "終日"} onChange={(e) => setTimeType(e.target.value)} /> 終日</label>
                <label><input type="radio" name={`time-${d}`} value="昼" checked={timeType === "昼"} onChange={(e) => setTimeType(e.target.value)} /> 昼</label>
                <label><input type="radio" name={`time-${d}`} value="夜" checked={timeType === "夜"} onChange={(e) => setTimeType(e.target.value)} /> 夜</label>
                <label><input type="radio" name={`time-${d}`} value="時間指定" checked={timeType === "時間指定"} onChange={(e) => setTimeType(e.target.value)} /> 時間指定</label>
              </div>
              {renderTimeDropdown()}
            </div>
          ))}
        </div>
      </div>

      {/* 共有リンク */}
      <button className="save-btn" onClick={handleSave}>共有リンクを発行</button>
      {shareUrl && (
        <div className="share-link-box">
          <input type="text" value={shareUrl} readOnly />
          <button className="copy-btn" onClick={() => navigator.clipboard.writeText(shareUrl)}>コピー</button>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
