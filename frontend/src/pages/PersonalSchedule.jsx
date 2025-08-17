import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function PersonalSchedule() {
  const [date, setDate] = useState(new Date());

  return (
    <div className="text-center">
      <h2 className="text-2xl text-secondary mb-4">個人スケジュール</h2>
      <Calendar onChange={setDate} value={date} className="rounded-lg shadow-lg p-4" />
      <p className="mt-4">選択日: {date.toDateString()}</p>
    </div>
  );
}
