import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function ShareLinkPage() {
  const { linkid } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    axios.get("/api/schedules").then(res => {
      setSchedules(res.data.filter(s => s.linkid === linkid));
    });
    axios.get("/api/holidays").then(res => setHolidays(res.data));
  }, [linkid]);

  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const holiday = holidays.find(h => h.date === date.toISOString().split("T")[0]);
      if (holiday) {
        return <p className="text-red-500 text-xs">{holiday.name}</p>;
      }
    }
    return null;
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const holiday = holidays.find(h => h.date === date.toISOString().split("T")[0]);
      if (holiday) {
        return "bg-red-100";
      }
    }
    return null;
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-[#004CA0]">共有スケジュール</h2>
      <Calendar
        onChange={setDate}
        value={date}
        tileContent={tileContent}
        tileClassName={tileClassName}
      />
      <ul className="mt-4">
        {schedules.map(s => (
          <li key={s.id} className="border-b py-2">
            {s.date} {s.title} ({s.timeslot})
          </li>
        ))}
      </ul>
    </div>
  );
}
