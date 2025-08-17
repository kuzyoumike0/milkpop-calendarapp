import React from "react";
import holidayJp from "holiday-jp";

export default function HolidayLabel({ date }) {
  const holidays = holidayJp.between(
    new Date(date.getFullYear(), 0, 1),
    new Date(date.getFullYear(), 11, 31)
  );
  const holiday = holidays.find(h => h.date.getTime() === date.getTime());
  return holiday ? <span className="ml-2 text-red-500 font-semibold">{holiday.name}</span> : null;
}
