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
  const [selectedDates, setSelectedDates] = useState([]); // {date, timeOption}
  const [shareUrl, setShareUrl] = useState("");

  // 日付クリック処理
  const handleDateClick = (date) => {
    if (selectionMode === "range") {
      if (!rangeStart) {
        setRangeStart(date);
        setSelectedDates([{ date, timeOption: "all" }]);
      } else {
        if (rangeStart.toDateString() === date.toDateString()) {
          setRangeStart(null);
          setSelectedDates([]);
          return;
        }

        const start = rangeStart < date ? rangeStart : date;
        const end = rangeStart < date ? date : rangeStart;

        const days = [];
        let d = new Date(start);
        while (d <= end) {
          days.push({ date: new Date(d), timeOption: "all" });
          d.setDate(d.getDate() + 1);
        }

        setSelectedDates(days);
        setRangeStart(null);
      }
    } else if (selectionMode === "multiple") {
      const exists = selectedDates.some(
        (d) => d.date.toDateString() === date.toDateString()
      );
      if (exists) {
        setSelectedDates(
          selectedDates.filter((d) => d.date.toDateString() !== date.toDateString())
        );
      } else {
        setSelectedDates([...selectedDates, { date, timeOption: "all" }]);
      }
    }
  };

  // 区分変更
  const handleTimeOptionChange = (index, value) => {
    const updated = [...selectedDates];
    updated[index].timeOption = value;
    setSelectedDates(updated);
  };

  // 日程登録
  const handleRegister = () => {
    if (!title || selectedDates.length === 0) return;

    const newEvents = selectedDates.map(({ date, timeOption }) => {
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

      return { title, start, end };
    });

    setEvents([...events, ...newEvents]);
    setTitle("");
    setSelectedDates([]);
  };

  // カレンダーセルのカスタムクラス
  const dayPropGetter = (date) => {
    const isSelected = selectedDates.some(
      (d) => d.date.toDateString() === date.toDateString()
    );
    const isRangeStart =
      rangeStart && rangeStart.toDateString() === date.toDateString();

    if (isRangeStart) {
      return { className: "range-start" };
    }
    if (isSelected) {
      return { className: "selected-day" };
    }
    return {};
  };

  return (
    <main className="page-card">
      <h2 className="page-title">日程登録ページ</h2>

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

      <button onClick={handleRegister}>登録</button>

      {/* カレンダー */}
      <div className="calendar-container" style={{ marginTop: "2rem" }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          selectable
          style={{ height: 500 }}
          onSelectSlot={(slotInfo) => handleDateClick(slotInfo.start)}
          dayPropGetter={dayPropGetter}
        />
      </div>

      {/* 選択中の日程 */}
      <div className="selected-dates">
        <h3>選択した日付:</h3>
        <ul>
          {selectedDates.map((d, idx) => (
            <li key={idx}>
              {d.date.toDateString()}{" "}
              <select
                value={d.timeOption}
                onChange={(e) => handleTimeOptionChange(idx, e.target.value)}
              >
                <option value="all">終日</option>
                <option value="day">昼</option>
                <option value="night">夜</option>
              </select>
            </li>
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
    </main>
  );
};

export default RegisterPage;
