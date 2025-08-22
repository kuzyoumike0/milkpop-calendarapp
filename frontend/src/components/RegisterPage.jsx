import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../index.css";

const localizer = momentLocalizer(moment);

const RegisterPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [division, setDivision] = useState("終日");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  // 時刻選択リスト
  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const h = String(i).padStart(2, "0");
    return `${h}:00`;
  });

  // スロット選択時
  const handleSelectSlot = ({ start, end }) => {
    setSelectedSlot({ start, end });
  };

  // イベント追加
  const handleAddEvent = () => {
    if (!selectedSlot) return;

    const newEvent = {
      id: Date.now(),
      title:
        division === "時間指定"
          ? `予定 (${startTime} - ${endTime})`
          : `予定 (${division})`,
      start:
        division === "時間指定"
          ? new Date(
              selectedSlot.start.getFullYear(),
              selectedSlot.start.getMonth(),
              selectedSlot.start.getDate(),
              parseInt(startTime.split(":")[0])
            )
          : selectedSlot.start,
      end:
        division === "時間指定"
          ? new Date(
              selectedSlot.start.getFullYear(),
              selectedSlot.start.getMonth(),
              selectedSlot.start.getDate(),
              parseInt(endTime.split(":")[0])
            )
          : selectedSlot.end,
      division,
    };

    setEvents([...events, newEvent]);
    setSelectedSlot(null);
    setDivision("終日");
    setStartTime("09:00");
    setEndTime("10:00");
  };

  // イベント削除
  const handleDeleteEvent = (id) => {
    setEvents(events.filter((ev) => ev.id !== id));
  };

  return (
    <div className="page-card">
      <h2 className="page-title">📅 日程登録</h2>
      <p className="page-subtitle">Googleカレンダー風のスケジューラー</p>

      {/* カレンダー */}
      <div className="calendar-container">
        <Calendar
          selectable
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          views={["month", "week", "day", "agenda"]}
          onSelectSlot={handleSelectSlot}
          popup
        />
      </div>

      {/* フォーム */}
      {selectedSlot && (
        <div className="form-card">
          <h3>新しい予定を追加</h3>
          <div className="form-row">
            <label>区分:</label>
            <select value={division} onChange={(e) => setDivision(e.target.value)}>
              <option value="午前">午前</option>
              <option value="午後">午後</option>
              <option value="終日">終日</option>
              <option value="時間指定">時間指定</option>
            </select>
          </div>

          {division === "時間指定" && (
            <div className="form-row">
              <label>開始:</label>
              <select value={startTime} onChange={(e) => setStartTime(e.target.value)}>
                {timeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <label>終了:</label>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              >
                {timeOptions.filter((t) => t > startTime).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button className="add-btn" onClick={handleAddEvent}>
            ➕ 予定を追加
          </button>
        </div>
      )}

      {/* 登録済みイベント */}
      {events.length > 0 && (
        <div className="event-list">
          <h3>登録済みイベント</h3>
          {events.map((ev) => (
            <div key={ev.id} className="event-card">
              <p>
                {moment(ev.start).format("YYYY/MM/DD HH:mm")} ~{" "}
                {moment(ev.end).format("HH:mm")} <br />
                ⏰ {ev.division}
              </p>
              <button
                className="delete-btn"
                onClick={() => handleDeleteEvent(ev.id)}
              >
                削除
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
