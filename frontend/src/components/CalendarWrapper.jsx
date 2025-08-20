import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function CalendarWrapper({ mode, onChange, value }) {
  const [holidays, setHolidays] = useState([]);

  // Google Calendar API で日本の祝日を取得
  useEffect(() => {
    async function fetchHolidays() {
      try {
        const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
        const calendarId = "japanese__ja@holiday.calendar.google.com";
        const today = new Date().toISOString();
        const res = await axios.get(
          `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${apiKey}&timeMin=${today}&maxResults=50&singleEvents=true&orderBy=startTime`
        );
        const events = res.data.items.map((item) => item.start.date);
        setHolidays(events);
      } catch (err) {
        console.error("祝日取得エラー:", err);
      }
    }
    fetchHolidays();
  }, []);

  // 日付をフォーマット (yyyy-mm-dd)
  const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  return (
    <Calendar
      selectRange={mode === "range"}
      value={value}
      onChange={onChange}
      tileClassName={({ date, view }) => {
        if (view === "month" && holidays.includes(formatDate(date))) {
          return "text-red-500 font-bold"; // 祝日を赤字表示
        }
        return "";
      }}
      className="rounded-xl shadow bg-white p-2"
    />
  );
}
