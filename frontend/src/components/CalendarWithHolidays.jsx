import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function CalendarWithHolidays({ onSelectDates }) {
  const [date, setDate] = useState(new Date());
  const [holidays, setHolidays] = useState({});

  useEffect(() => {
    axios.get("/api/holidays").then(res => setHolidays(res.data));
  }, []);

  const onChange = (d) => {
    const dates = Array.isArray(d) ? d : [d];
    const formatted = dates.map(dt => dt.toISOString().split("T")[0]);
    setDate(d);
    onSelectDates(formatted);
  };

  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const ymd = date.toISOString().split("T")[0];
      if (holidays[ymd]) {
        return <p style={{ color: "red", fontSize: "0.7em" }}>{holidays[ymd]}</p>;
      }
    }
    return null;
  };

  return (
    <Calendar
      onChange={onChange}
      value={date}
      selectRange={true}
      tileContent={tileContent}
    />
  );
}
