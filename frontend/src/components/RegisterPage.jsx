// src/components/RegisterPage.jsx
import React, { useState } from "react";  // ← セミコロン必須
import { Calendar, momentLocalizer } from "react-big-calendar"; // ← セミコロン必須
import moment from "moment"; // ← セミコロン必須
import "../index.css"; // ← セミコロン必須

const localizer = momentLocalizer(moment);

const RegisterPage = () => {
  const [selectedDates, setSelectedDates] = useState([]);
  const [timeOption, setTimeOption] = useState("allday");
  const [startTime, setStartTime] = useState("01:00");
  const [endTime, setEndTime] = useState("00:00");

  const handleSelectSlot = ({ start }) => {
    setSelectedDates([...selectedDates, start]);
  };

  const handleRegister = () => {
    if (timeOption === "custom" && startTime >= endTime) {
      alert("開始時刻は終了時刻より前にしてください。");
      return;
    }
    alert("登録が完了しました！");
  };

  return (
    <div className="register-page">
      <h2 className="register-title">イベント登録</h2>
      <input
        type="text"
        placeholder="イベントタイトルを入力"
        className="title-input"
      />

      <div className="calendar-container">
        <Calendar
          localizer={localizer}
          selectable
          onSelectSlot={handleSelectSlot}
          style={{ height: 400 }}
        />
      </div>

      <div className="time-options">
        <select
          className="time-dropdown"
          value={timeOption}
          onChange={(e) => setTimeOption(e.target.value)}
        >
          <option value="allday">終日</option>
          <option value="day">昼</option>
          <option value="night">夜</option>
          <option value="custom">時間指定</option>
        </select>
      </div>

      {timeOption === "custom" && (
        <div className="time-range">
          <label>開始:</label>
          <select
            className="time-dropdown"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={`${String(i).padStart(2, "0")}:00`}>
                {i}:00
              </option>
            ))}
          </select>

          <label>終了:</label>
          <select
            className="time-dropdown"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={`${String(i).padStart(2, "0")}:00`}>
                {i}:00
              </option>
            ))}
          </select>
        </div>
      )}

      <button className="register-button" onClick={handleRegister}>
        登録
      </button>
    </div>
  );
};

export default RegisterPage;
