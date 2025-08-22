// frontend/src/components/RegisterPage.jsx
import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import Holidays from "date-holidays";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../index.css";

const localizer = momentLocalizer(moment);

const RegisterPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [division, setDivision] = useState("終日");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  const hd = new Holidays("JP"); // 🇯🇵 日本の祝日

  // ✅ 毎年祝日を自動追加
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    let holidayEvents = [];

    // 今年と来年分をあらかじめ登録
    for (let year = currentYear; year <= currentYear + 1; year++) {
      const holidayList = hd.getHolidays(year);
      holidayEvents = [
        ...holidayEvents,
        ...holidayList.map((h) => ({
          id: `holiday-${h.date}`,
          title: `🎌 ${h.name}`,
          start: new Date(h.date),
          end: new Date(h.date),
          allDay: true,
          type: "holiday",
        })),
      ];
    }

    setEvents((prev) => [...holidayEvents, ...prev]);
  }, []);

  // 時刻リスト
  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const h = String(i).padStart(2, "0");
    return `${h}:00`;
  });

  const handleSelectSlot = ({ start, end }) => setSelectedSlot({ start, end });

  // 予定追加
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

  const handleDeleteEvent = (id) => {
    if (String(id).startsWith("holiday-")) return; // 🎌 祝日は削除禁止
    setEvents(events.filter((ev) => ev.id !== id));
  };

  return (
    <div className="page-card">
      <h2 className="page-title">📅 日程登録</h2>
      <p className="page-subtitle">Googleカレンダー風スケジューラー（祝日対応）</p>

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
          eventPropGetter={(event) => {
            if (event.type === "holiday") {
              return {
                style: {
                  backgroundColor: "#ffe5e5",
                  color: "#d60000",
                  fontWeight: "bold",
                  border: "1px solid #d60000",
                },
              };
            }
            return { style: {} };
          }}
        />
      </div>

      {/* 予定追加フォーム */}
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
              <select value={endTime} onChange={(e) => setEndTime(e.target.value)}>
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

      {/* イベント一覧 */}
      {events.filter((ev) => ev.type !== "holiday").length > 0 && (
        <div className="event-list">
          <h3>登録済みイベント</h3>
          {events
            .filter((ev) => ev.type !== "holiday")
            .map((ev) => (
              <div key={ev.id} className="event-card">
                <p>
                  {moment(ev.start).format("YYYY/MM/DD HH:mm")} ~{" "}
                  {moment(ev.end).format("HH:mm")} <br />
                  ⏰ {ev.division}
                </p>
                <button className="delete-btn" onClick={() => handleDeleteEvent(ev.id)}>
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
