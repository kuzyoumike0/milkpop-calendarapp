import { useState, useEffect } from "react";
import axios from "axios";

export default function useHolidays() {
  const [holidays, setHolidays] = useState({});

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const year = new Date().getFullYear();
        const res = await axios.get(
          `https://www.googleapis.com/calendar/v3/calendars/japanese__ja@holiday.calendar.google.com/events?key=${process.env.REACT_APP_GOOGLE_API_KEY}&timeMin=${year}-01-01T00:00:00Z&timeMax=${year}-12-31T23:59:59Z`
        );
        const data = {};
        res.data.items.forEach((item) => {
          if (item.start && item.start.date) {
            data[item.start.date] = item.summary;
          }
        });
        setHolidays(data);
      } catch (err) {
        console.error("祝日取得エラー:", err);
      }
    };
    fetchHolidays();
  }, []);

  return holidays;
}
