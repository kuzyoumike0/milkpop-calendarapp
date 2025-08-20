import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../index.css";
import axios from "axios";
import Holidays from "date-holidays";

const hd = new Holidays("JP");

export default function LinkPage() {
  const [title, setTitle] = useState("");
  const [dates, setDates] = useState([]);
  const [timeslot, setTimeslot] = useState("終日");
  const [rangeMode, setRangeMode] = useState("multiple");
  const [link, setLink] = useState(null);

  const handleChange = (selected) => {
    if (Array.isArray(selected)) {
      const [start, end] = selected;
      const range = [];
      let current = new Date(start);
      while (current <= end) {
        range.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      setDates(range);
      setRangeMode("range");
    } else {
      const exists = dates.find(
        (d) => d.toDateString() === selected.toDateString()
      );
      if (exists) {
        setDates(dates.filter((d) => d.toDateString() !== selected.toDateString()));
      } else {
        setDates([...dates, selected]);
      }
      setRangeMode("multiple");
    }
  };

  const handleSubmit = async () => {
    if (!title || dates.length === 0) return;
    const res = await axios.post("/api/link", {
      title,
      dates: dates.map((d) => d.toISOString().slice(0, 10)),
      timeslot,
      range_mode: rangeMode,
    });
    setLink(res.data.link);
    setTitle("");
    setDates([]);
    setTimeslot("終日");
  };

  return (
    <div className="page">
      <h2>日程登録（共有リンク）</h2>
      <input
        type="text"
        placeholder="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Calendar
        onClickDay={handleChange}
        selectRange={true}
        tileClassName={({ date }) => {
          let classes = [];
          if (dates.some((d) => d.toDateString() === date.toDateString())) {
            classes.push("selected-date");
          }
          if (hd.isHoliday(date)) {
            classes.push("holiday-date");
          }
          return classes;
        }}
      />
      <div className="options">
        <label>
          時間帯:
          <select value={timeslot} onChange={(e) => setTimeslot(e.target.value)}>
            <option value="終日">終日</option>
            <option value="昼">昼</option>
            <option value="夜">夜</option>
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={`${i}:00`}>
                {i}:00
              </option>
            ))}
          </select>
        </label>
      </div>
      <button onClick={handleSubmit}>リンク発行</button>

      {link && (
        <div>
          <p>共有リンクが発行されました:</p>
          <a href={link} target="_blank" rel="noreferrer">
            {link}
          </a>
        </div>
      )}
    </div>
  );
}
