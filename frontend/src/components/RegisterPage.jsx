// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import ja from "date-fns/locale/ja";
import Holidays from "date-holidays";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../index.css";

const locales = { ja };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

// 日本の祝日データ
const hd = new Holidays("JP");

const RegisterPage = () => {
  const [selectionMode, setSelectionMode] = useState("range"); // range or multiple
  const [rangeStart, setRangeStart] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);

  // 範囲選択モード
  const handleSelectRange = ({ start, end }) => {
    if (selectionMode !== "range") return;

    const days = [];
    let d = new Date(start);
    while (d <= end) {
      days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    setSelectedDates(days);
  };

  // 複数選択モード
  const handleSelectDay = ({ start }) => {
    if (selectionMode !== "multiple") return;

    const dateStr = start.toDateString();
    setSelectedDates((prev) => {
      const exists = prev.find((d) => d.toDateString() === dateStr);
      if (exists) {
        return prev.filter((d) => d.toDateString() !== dateStr);
      } else {
        return [...prev, start];
      }
    });
  };

  // イベントスタイル（選択＆祝日強調）
  const eventStyleGetter = (event) => {
    const isSelected = selectedDates.some(
      (d) => d.toDateString() === event.start.toDateString()
    );
    const isHoliday = hd.isHoliday(event.start);

    return {
      style: {
        backgroundColor: isSelected
          ? "#FDB9C8"
          : isHoliday
          ? "#004CA0"
          : "#222",
        color: "#fff",
        borderRadius: "6px",
        border: "none",
      },
    };
  };

  return (
    <div className="page-container">
      <h2 className="page-title">日程登録ページ</h2>

      {/* 選択モード切替 */}
      <div className="mode-switch">
        <label>
          <input
            type="radio"
            value="range"
            checked={selectionMode === "range"}
            onChange={() => setSelectionMode("range")}
          />
          範囲選択
        </label>
        <label>
          <input
            type="radio"
            value="multiple"
            checked={selectionMode === "multiple"}
            onChange={() => setSelectionMode("multiple")}
          />
          複数選択
        </label>
      </div>

      {/* カレンダー＋日程一覧 */}
      <div className="calendar-wrapper">
        <div className="calendar-container">
          <Calendar
            localizer={localizer}
            selectable
            onSelectSlot={
              selectionMode === "range" ? handleSelectRange : handleSelectDay
            }
            events={selectedDates.map((d) => ({
              start: d,
              end: d,
              title: "選択中",
            }))}
            style={{ height: 600 }}
            eventPropGetter={eventStyleGetter}
          />
        </div>

        <div className="selected-list">
          <h3>選択された日程</h3>
          <ul>
            {selectedDates.map((d, i) => (
              <li key={i}>{format(d, "yyyy/MM/dd (E)", { locale: ja })}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
