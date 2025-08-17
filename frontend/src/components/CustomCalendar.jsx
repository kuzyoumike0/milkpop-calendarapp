import React, { useState } from "react";
import "./CustomCalendar.css";

export default function CustomCalendar() {
  const [selectedDates, setSelectedDates] = useState([]);

  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  const toggleDate = (day) => {
    setSelectedDates((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <div className="calendar-grid">
      {days.map((day) => (
        <div
          key={day}
          className={`calendar-cell ${selectedDates.includes(day) ? "selected" : ""}`}
          onClick={() => toggleDate(day)}
        >
          {day}
        </div>
      ))}
    </div>
  );
}
