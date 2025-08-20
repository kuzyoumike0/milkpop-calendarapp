import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const HOLIDAY_CALENDAR_ID = "japanese__ja@holiday.calendar.google.com";

export default function LinkPage() {
  const [title, setTitle] = useState("");
  const [dates, setDates] = useState([]);
  const [rangeMode, setRangeMode] = useState("multiple");
  const [timeslot, setTimeslot] = useState("終日");
  const [link, setLink] = useState("");
  const [holidays, setHolidays] = useState([]);

  // === 祝日データ取得 ===
  useEffect(() => {
    const fetchHolidays = async () => {
      const year = new Date().getFullYear();
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${HOLIDAY_CALENDAR_ID}/events?key=${GOOGLE_API_KEY}&timeMin=${year}-01-01T00:00:00Z&timeMax=${year}-12-31T23:59:59Z&singleEvents=true&orderBy=startTime`
      );
      const data = await res.json();
      if (data.items) {
        const holidayList = data.items.map((item) => item.start.date);
        setHolidays(holidayList);
      }
    };
    fetchHolidays();
  }, []);

  const handleDateChange = (value) => {
    if (rangeMode === "range") {
      setDates(value);
    } else {
      setDates(Array.isArray(value) ? value : [value]);
    }
  };

  const handleSubmit = async () => {
    const formattedDates = Array.isArray(dates)
      ? dates.map((d) => d.toISOString().split("T")[0])
      : [dates.toISOString().split("T")[0]];
    const res = await axios.post("/api/schedule", {
      title,
      dates: formattedDates,
      timeslot,
      range_mode: rangeMode,
    });
    setLink(res.data.link);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-[#004CA0]">日程登録ページ</h2>
      <input
        type="text"
        placeholder="タイトルを入力"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 w-full mb-4 rounded"
      />
      <div className="mb-4">
        <label className="mr-4">
          <input
            type="radio"
            checked={rangeMode === "multiple"}
            onChange={() => setRangeMode("multiple")}
          />
          複数選択
        </label>
        <label>
          <input
            type="radio"
            checked={rangeMode === "range"}
            onChange={() => setRangeMode("range")}
          />
          範囲選択
        </label>
      </div>
      <Calendar
        onChange={handleDateChange}
        value={dates}
        selectRange={rangeMode === "range"}
        tileClassName={({ date }) => {
          const day = date.toISOString().split("T")[0];
          return holidays.includes(day) ? "!text-red-600 font-bold" : "";
        }}
      />
      <div className="mt-4">
        <select
          value={timeslot}
          onChange={(e) => setTimeslot(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option>終日</option>
          <option>昼</option>
          <option>夜</option>
          <option>1時から0時</option>
        </select>
      </div>
      <button
        onClick={handleSubmit}
        className="bg-[#FDB9C8] text-black px-6 py-2 mt-6 rounded shadow hover:scale-105"
      >
        共有リンクを発行
      </button>
      {link && (
        <p className="mt-4">
          発行されたリンク:{" "}
          <a href={link} className="text-[#004CA0] underline">
            {window.location.origin + link}
          </a>
        </p>
      )}
    </div>
  );
}
