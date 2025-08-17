import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function SharedCalendar() {
  const [range, setRange] = useState(null);

  return (
    <div className="p-4 bg-white/30 rounded-2xl shadow-xl">
      <h1 className="text-xl font-bold mb-4">共有カレンダー</h1>
      <Calendar selectRange={true} onChange={setRange} />
      {range && (
        <div className="mt-4">
          <p>開始日: {range[0].toLocaleDateString()}</p>
          <p>終了日: {range[1].toLocaleDateString()}</p>
        </div>
      )}
    </div>
  );
}
