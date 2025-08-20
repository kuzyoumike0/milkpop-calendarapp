import { useEffect, useState } from "react";
import axios from "axios";

const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY; 
const CALENDAR_ID = "japanese__ja@holiday.calendar.google.com";

export function useHolidays() {
  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    async function fetchHolidays() {
      try {
        const now = new Date();
        const start = `${now.getFullYear()}-01-01T00:00:00Z`;
        const end = `${now.getFullYear()}-12-31T23:59:59Z`;

        const url = `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?key=${API_KEY}&timeMin=${start}&timeMax=${end}&singleEvents=true&orderBy=startTime`;

        const res = await axios.get(url);

        const holidayDates = res.data.items.map((item) => item.start.date);
        setHolidays(holidayDates);
      } catch (err) {
        console.error("祝日取得エラー:", err);
      }
    }

    fetchHolidays();
  }, []);

  return holidays;
}
