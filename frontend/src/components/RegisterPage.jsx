// frontend/src/components/RegisterPage.jsx
import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import Holidays from "date-holidays";
import { v4 as uuidv4 } from "uuid";
import "../common.css";
import "../register.css";

const hd = new Holidays("JP"); // 日本の祝日

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [timeType, setTimeType] = useState("終日");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [schedules, setSchedules] = useState([]);

  // ===== カレンダーで日付クリック =====
  const handleDateClick = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    if (selectedDates.includes(dateStr)) {
      setSelectedDates(selectedDates.filter((d) => d !== dateStr));
    } else {
      setSelectedDates([...selectedDates, dateStr].sort());
    }
  };

  // ===== 保存 =====
  const handleSave = async () => {
    if (!title || selectedDates.length === 0) return alert("タイトルと日付を入力してください");

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

  // ===== 祝日名を返す =====
  const getHolidayName = (date) => {
    const h = hd.isHoliday(date);
    return h ? h[0].name : null;
  };

  // ===== 時間選択のドロップダウンを作る =====
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
    <div className="register-container">
      <h1 className="register-title">MilkPOP Calendar</h1>

      {/* 入力フォーム */}
      <div className="form-container">
        <input
          type="text"
          placeholder="タイトルを入力"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="title-input"
        />

        <div className="calendar-and-list">
          <div className="calendar-box">
            <Calendar
              locale="ja-JP"
              onClickDay={handleDateClick}
              tileContent={({ date }) => {
                const holiday = getHolidayName(date);
                return holiday ? <p className="holiday-name">{holiday}</p> : null;
              }}
              tileClassName={({ date }) => {
                const dateStr = date.toISOString().split("T")[0];
                if (selectedDates.includes(dateStr)) return "selected-date";
                if (date.getDay() === 0) return "sunday";
                if (date.getDay() === 6) return "saturday";
                return null;
              }}
            />
          </div>

          <div className="selected-list">
            <h3>選択された日程</h3>
            <ul>
              {selectedDates.map((d) => (
                <li key={d}>
                  {d} （{timeType}
                  {timeType === "時間指定" && startTime && endTime
                    ? ` ${startTime} ~ ${endTime}`
                    : ""}
                  ）
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 時間帯選択 */}
        <div className="time-options">
          <label><input type="radio" value="終日" checked={timeType === "終日"} onChange={(e) => setTimeType(e.target.value)} /> 終日</label>
          <label><input type="radio" value="昼" checked={timeType === "昼"} onChange={(e) => setTimeType(e.target.value)} /> 昼</label>
          <label><input type="radio" value="夜" checked={timeType === "夜"} onChange={(e) => setTimeType(e.target.value)} /> 夜</label>
          <label><input type="radio" value="時間指定" checked={timeType === "時間指定"} onChange={(e) => setTimeType(e.target.value)} /> 時間指定</label>
        </div>

        {renderTimeDropdown()}

        <button className="save-btn" onClick={handleSave}>共有リンクを発行</button>
        {shareUrl && (
          <div className="share-link-box">
            <input type="text" value={shareUrl} readOnly className="share-link" />
            <button
              className="copy-btn"
              onClick={() => navigator.clipboard.writeText(shareUrl)}
            >
              コピー
            </button>
          </div>
        )}
      </div>

      {/* 登録済みカレンダー一覧 */}
      <div className="schedules-list">
        <h2>登録済みスケジュール</h2>
        <ul>
          {schedules.map((s) => (
            <li key={s.id}>
              <strong>{s.title}</strong>
              <ul>
                {s.dates.map((d, i) => (
                  <li key={i}>
                    {d.date} （{d.timeType}
                    {d.timeType === "時間指定" && d.startTime && d.endTime
                      ? ` ${d.startTime} ~ ${d.endTime}`
                      : ""}
                    ）
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RegisterPage;
