// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import ja from "date-fns/locale/ja";
import "../index.css";

const locales = {
  ja: ja,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const RegisterPage = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeOption, setTimeOption] = useState("allDay");
  const [startTime, setStartTime] = useState("01:00");
  const [endTime, setEndTime] = useState("00:00");

  const handleSelectSlot = ({ start }) => {
    setSelectedDate(start);
  };

  const handleSubmit = () => {
    if (timeOption === "custom" && startTime >= endTime) {
      alert("開始時刻は終了時刻より前にしてください。");
      return;
    }
    alert(
      `登録しました！\n日付: ${format(selectedDate, "yyyy/MM/dd")}\n時間: ${
        timeOption === "allDay"
          ? "終日"
          : timeOption === "day"
          ? "昼"
          : timeOption === "night"
          ? "夜"
          : `${startTime} ~ ${endTime}`
      }`
    );
  };

  return (
    <div className="register-page">
      <h2 className="page-title">日程登録</h2>

      {/* カレンダー */}
      <div className="calendar-wrapper">
        <Calendar
          localizer={localizer}
          selectable
          onSelectSlot={handleSelectSlot}
          style={{ height: 500 }}
          views={["month"]}
        />
      </div>

      {/* プルダウン */}
      <div className="form-section">
        <label className="form-label">時間帯を選択:</label>
        <select
          value={timeOption}
          onChange={(e) => setTimeOption(e.target.value)}
          className="form-select"
        >
          <option value="allDay">終日</option>
          <option value="day">昼</option>
          <option value="night">夜</option>
          <option value="custom">時間指定</option>
        </select>
      </div>

      {/* 時間指定の場合だけ表示 */}
      {timeOption === "custom" && (
        <div className="form-section time-range">
          <label>開始時刻:</label>
          <select
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="form-select"
          >
            {Array.from({ length: 24 }, (_, i) => {
              const hour = (i + 1) % 24;
              return (
                <option key={hour} value={`${hour.toString().padStart(2, "0")}:00`}>
                  {hour}:00
                </option>
              );
            })}
          </select>
          <label>終了時刻:</label>
          <select
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="form-select"
          >
            {Array.from({ length: 24 }, (_, i) => {
              const hour = (i + 1) % 24;
              return (
                <option key={hour} value={`${hour.toString().padStart(2, "0")}:00`}>
                  {hour}:00
                </option>
              );
            })}
          </select>
        </div>
      )}

      {/* 登録ボタン */}
      <button className="register-button" onClick={handleSubmit}>
        登録
      </button>
    </div>
  );
};

export default RegisterPage;
