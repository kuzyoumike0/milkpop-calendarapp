// frontend/src/components/PersonalPage.jsx
import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../index.css";
import Header from "./Header";
import Footer from "./Footer";

const localizer = momentLocalizer(moment);

const PersonalPage = () => {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [events, setEvents] = useState([]);
  const [selectionMode, setSelectionMode] = useState("range");
  const [rangeStart, setRangeStart] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [timeOption, setTimeOption] = useState("all");

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

  // 登録処理
  const handleRegister = () => {
    if (!title || selectedDates.length === 0) return;

    const newEvents = selectedDates.map((date) => {
      let start = new Date(date);
      let end = new Date(date);

      if (timeOption === "all") {
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
      } else if (timeOption === "day") {
        start.setHours(9, 0, 0, 0);
        end.setHours(17, 0, 0, 0);
      } else if (timeOption === "night") {
        start.setHours(18, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
      }

      return { title, start, end, memo };
    });

    setEvents([...events, ...newEvents]);
    setTitle("");
    setMemo("");
    setSelectedDates([]);
  };

  return (
    <div className="page-container">
      <Header />

      <main className="page-card">
        <h2 className="page-title">個人スケジュール</h2>

        {/* 入力フォーム */}
        <div className="form-group">
          <label>タイトル:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>メモ:</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>選択方法:</label>
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
          <label style={{ marginLeft: "1rem" }}>
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

        <div className="form-group">
          <label>時間帯:</label>
          <select
            value={timeOption}
            onChange={(e) => setTimeOption(e.target.value)}
          >
            <option value="all">終日</option>
            <option value="day">昼</option>
            <option value="night">夜</option>
          </select>
        </div>

        <button onClick={handleRegister}>登録</button>

        {/* カレンダー */}
        <div className="calendar-container" style={{ marginTop: "2rem" }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            selectable
            onSelectSlot={(slotInfo) => handleDateClick(slotInfo.start)}
          />
        </div>

        {/* 登録済み一覧 */}
        <div className="selected-dates" style={{ marginTop: "2rem" }}>
          <h3>登録済みスケジュール:</h3>
          <ul>
            {events.map((ev, idx) => (
              <li key={idx}>
                {ev.title} ({ev.start.toLocaleDateString()} {ev.memo && `- ${ev.memo}`})
              </li>
            ))}
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PersonalPage;
