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
  const [startHour, setStartHour] = useState(1);
  const [endHour, setEndHour] = useState(2);

  // 時間プルダウン用の選択肢
  const hours = Array.from({ length: 24 }, (_, i) => (i + 1) % 24);

  const handleSelectSlot = ({ start, end }) => {
    setSelectedSlot({ start, end });
  };

  const handleRegister = () => {
    if (!title || !selectedSlot) {
      alert("タイトルと日程を選んでください！");
      return;
    }

    // バリデーション: 開始が終了より後ならエラー
    if (startHour >= endHour) {
      alert("開始時刻は終了時刻より前にしてください！");
      return;
    }

    const newEvent = {
      title: `${title} (${startHour}:00〜${endHour}:00)`,
      start: new Date(
        selectedSlot.start.getFullYear(),
        selectedSlot.start.getMonth(),
        selectedSlot.start.getDate(),
        startHour
      ),
      end: new Date(
        selectedSlot.start.getFullYear(),
        selectedSlot.start.getMonth(),
        selectedSlot.start.getDate(),
        endHour
      ),
    };

    setEvents([...events, newEvent]);
    setTitle("");
    setSelectedSlot(null);
  };

  return (
    <div className="register-page">
      <h2 className="page-title">📅 日程登録</h2>

      <div className="register-form">
        <div className="form-group">
          <label>イベントタイトル</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例: 七夕イベント"
          />
        </div>

        <div className="form-group">
          <label>時間指定</label>
          <div className="time-select">
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
            〜
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
        </div>

        <button className="submit-btn" onClick={handleRegister}>
          登録する
        </button>
      </div>

      <div style={{ height: "600px", marginTop: "30px" }}>
        <Calendar
          selectable
          localizer={localizer}
          events={events}
          defaultView="month"
          style={{ borderRadius: "16px", overflow: "hidden" }}
          onSelectSlot={handleSelectSlot}
        />
      </div>
    </div>
  );
};

export default RegisterPage;
