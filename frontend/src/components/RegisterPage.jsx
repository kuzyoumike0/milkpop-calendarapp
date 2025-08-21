// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../index.css";

const localizer = momentLocalizer(moment);

const RegisterPage = () => {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [timeType, setTimeType] = useState("all"); // all, day, night, custom
  const [startHour, setStartHour] = useState(1);
  const [endHour, setEndHour] = useState(2);

  // 1時〜0時（24時間表記）
  const hours = Array.from({ length: 24 }, (_, i) => (i + 1) % 24);

  const handleSelectSlot = ({ start, end }) => {
    setSelectedSlot({ start, end });
  };

  const handleRegister = () => {
    if (!title || !selectedSlot) {
      alert("タイトルと日程を入力してください！");
      return;
    }

    let displayTime = "";
    let startDate = new Date(selectedSlot.start);
    let endDate = new Date(selectedSlot.start);

    if (timeType === "all") {
      displayTime = "終日";
      startDate.setHours(0);
      endDate.setHours(23, 59);
    } else if (timeType === "day") {
      displayTime = "昼";
      startDate.setHours(9);
      endDate.setHours(17);
    } else if (timeType === "night") {
      displayTime = "夜";
      startDate.setHours(18);
      endDate.setHours(23, 59);
    } else if (timeType === "custom") {
      if (startHour >= endHour) {
        alert("開始時刻は終了時刻より前にしてください！");
        return;
      }
      displayTime = `${startHour}:00〜${endHour}:00`;
      startDate.setHours(startHour);
      endDate.setHours(endHour);
    }

    const newEvent = {
      title: `${title} (${displayTime})`,
      start: startDate,
      end: endDate,
    };

    setEvents([...events, newEvent]);
    setTitle("");
    setSelectedSlot(null);
    setTimeType("all");
    setStartHour(1);
    setEndHour(2);
  };

  return (
    <div className="register-page">
      <h2 className="page-title">📅 日程登録</h2>

      {/* イベントタイトル */}
      <div className="form-group">
        <label>イベントタイトル</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例: 七夕イベント"
        />
      </div>

      {/* カレンダー */}
      <div style={{ height: "500px", margin: "20px 0" }}>
        <Calendar
          selectable
          localizer={localizer}
          events={events}
          defaultView="month"
          style={{ borderRadius: "16px", overflow: "hidden" }}
          onSelectSlot={handleSelectSlot}
        />
      </div>

      {/* 時間指定 */}
      <div className="form-group">
        <label>時間帯</label>
        <select
          value={timeType}
          onChange={(e) => setTimeType(e.target.value)}
          className="time-type-select"
        >
          <option value="all">終日</option>
          <option value="day">昼 (9:00〜17:00)</option>
          <option value="night">夜 (18:00〜23:59)</option>
          <option value="custom">時間指定</option>
        </select>
      </div>

      {/* custom 選択時だけプルダウン表示 */}
      {timeType === "custom" && (
        <div className="form-group time-select">
          <label>開始時刻</label>
          <select
            value={startHour}
            onChange={(e) => setStartHour(Number(e.target.value))}
          >
            {hours.map((h) => (
              <option key={h} value={h}>
                {h === 0 ? "0時" : `${h}時`}
              </option>
            ))}
          </select>

          <label>終了時刻</label>
          <select
            value={endHour}
            onChange={(e) => setEndHour(Number(e.target.value))}
          >
            {hours.map((h) => (
              <option key={h} value={h}>
                {h === 0 ? "0時" : `${h}時`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 登録ボタン */}
      <button className="submit-btn" onClick={handleRegister}>
        登録する
      </button>
    </div>
  );
};

export default RegisterPage;
