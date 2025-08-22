// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../index.css";

const localizer = momentLocalizer(moment);

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [events, setEvents] = useState([]);
  const [selectionMode, setSelectionMode] = useState("range"); // range or multiple
  const [rangeStart, setRangeStart] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [shareUrl, setShareUrl] = useState("");

  // 日付クリック処理
  const handleDateClick = (date) => {
    if (selectionMode === "range") {
      if (!rangeStart) {
        setRangeStart(date);
        setSelectedDates([date]);
      } else {
        const start = rangeStart < date ? rangeStart : date;
        const end = rangeStart < date ? date : rangeStart;

        const days = [];
        let d = new Date(start);
        while (d <= end) {
          days.push(new Date(d));
          d.setDate(d.getDate() + 1);
        }

        setSelectedDates(days);
        setRangeStart(null);
      }
    } else if (selectionMode === "multiple") {
      const exists = selectedDates.some(
        (d) => d.toDateString() === date.toDateString()
      );
      if (exists) {
        setSelectedDates(
          selectedDates.filter((d) => d.toDateString() !== date.toDateString())
        );
      } else {
        setSelectedDates([...selectedDates, date]);
      }
    }
  };

  // 日程登録
  const handleRegister = () => {
    if (!title || selectedDates.length === 0) return;

    const newEvents = selectedDates.map((date) => ({
      title: title,
      start: new Date(date.setHours(0, 0, 0, 0)),
      end: new Date(date.setHours(23, 59, 59, 999)),
    }));

    setEvents([...events, ...newEvents]);
    setTitle("");
    setSelectedDates([]);

    // 共有リンク作成（ダミー）
    const url = `${window.location.origin}/share/${Math.random()
      .toString(36)
      .substring(2, 8)}`;
    setShareUrl(url);
  };

  return (
    <div className="page-container">
      <h2 className="page-title">日程登録ページ</h2>

      {/* 入力フォーム */}
      <div className="form-container">
        <label>タイトル:</label>
        <input
          className="input-field"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="radio-container">
          <label>
            <input
              type="radio"
              name="mode"
              value="range"
              checked={selectionMode === "range"}
              onChange={() => setSelectionMode("range")}
            />
            範囲選択
          </label>
          <label>
            <input
              type="radio"
              name="mode"
              value="multiple"
              checked={selectionMode === "multiple"}
              onChange={() => setSelectionMode("multiple")}
            />
            複数選択
          </label>
        </div>

        <button className="submit-button" onClick={handleRegister}>
          登録
        </button>
      </div>

      {/* カレンダー */}
      <div className="calendar-container">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          selectable
          style={{ height: 500 }}
          onSelectSlot={(slotInfo) => handleDateClick(slotInfo.start)}
        />
      </div>

      {/* 選択中の日程 */}
      <div className="selected-dates">
        <h3>選択した日付:</h3>
        <ul>
          {selectedDates.map((d, idx) => (
            <li key={idx}>{d.toDateString()}</li>
          ))}
        </ul>
      </div>

      {/* 共有リンク */}
      {shareUrl && (
        <div className="share-link">
          <p>共有リンクが発行されました:</p>
          <a href={shareUrl} target="_blank" rel="noopener noreferrer">
            {shareUrl}
          </a>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
