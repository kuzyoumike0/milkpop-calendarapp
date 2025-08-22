import React, { useState } from "react";
import "../index.css";

const RegisterPage = () => {
  const [selectedDates, setSelectedDates] = useState([]);
  const [title, setTitle] = useState("");
  const [timeType, setTimeType] = useState("終日");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");

  // ==== 日付クリック ====
  const toggleDate = (date) => {
    if (selectedDates.includes(date)) {
      setSelectedDates(selectedDates.filter(d => d !== date));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  // ==== 自作カレンダー ====
  const renderCalendar = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= lastDate; d++) days.push(d);

    return (
      <div className="calendar-grid">
        {["日","月","火","水","木","金","土"].map((w,i)=>(
          <div key={i} className="weekday">{w}</div>
        ))}
        {days.map((d, i) => {
          const dateStr = d ? `${year}-${month+1}-${d}` : null;
          const isToday = d === today.getDate();
          const isSelected = selectedDates.includes(dateStr);
          return (
            <div
              key={i}
              className={`day ${isToday ? "today":""} ${isSelected ? "selected":""}`}
              onClick={() => d && toggleDate(dateStr)}
            >
              {d || ""}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="register-container">
      {/* 左：入力フォーム */}
      <div className="left-panel">
        <h2>📅 日程登録ページ</h2>
        <input
          type="text"
          placeholder="イベントタイトルを入力"
          value={title}
          onChange={(e)=>setTitle(e.target.value)}
          className="title-input"
        />

        <div className="time-type">
          <label>
            <input
              type="radio"
              value="終日"
              checked={timeType==="終日"}
              onChange={(e)=>setTimeType(e.target.value)}
            /> 終日
          </label>
          <label>
            <input
              type="radio"
              value="午前"
              checked={timeType==="午前"}
              onChange={(e)=>setTimeType(e.target.value)}
            /> 午前
          </label>
          <label>
            <input
              type="radio"
              value="午後"
              checked={timeType==="午後"}
              onChange={(e)=>setTimeType(e.target.value)}
            /> 午後
          </label>
          <label>
            <input
              type="radio"
              value="時間指定"
              checked={timeType==="時間指定"}
              onChange={(e)=>setTimeType(e.target.value)}
            /> 時間指定
          </label>
        </div>

        {timeType==="時間指定" && (
          <div className="time-select">
            <select value={startTime} onChange={(e)=>setStartTime(e.target.value)}>
              {Array.from({length:24},(_,i)=>`${i}:00`).map(t=>
                <option key={t} value={t}>{t}</option>
              )}
            </select>
            <span>〜</span>
            <select value={endTime} onChange={(e)=>setEndTime(e.target.value)}>
              {Array.from({length:24},(_,i)=>`${i}:00`).map(t=>
                <option key={t} value={t}>{t}</option>
              )}
            </select>
          </div>
        )}
      </div>

      {/* 右：カレンダーと選択リスト */}
      <div className="right-panel">
        {renderCalendar()}

        <div className="selected-list">
          <h3>✅ 選択した日程</h3>
          {selectedDates.length===0 ? (
            <p>日程が選択されていません</p>
          ) : (
            <ul>
              {selectedDates.map((d,i)=>(
                <li key={i}>{d} ({timeType}{timeType==="時間指定" && ` ${startTime}〜${endTime}`})</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
