import React, { useMemo } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import holidayJp from "@holiday-jp/holiday_jp";

export default function CustomCalendar({ value, onChange }){
  // 現在表示年の祝日をメモ化（当年＋前後年のゆるバッファ）
  const [year] = useMemo(()=>{
    try { return [value?.getFullYear?.() || new Date().getFullYear()]; }
    catch { return [new Date().getFullYear()]; }
  }, [value]);

  const holidays = useMemo(()=>{
    const start = new Date(year-1,0,1);
    const end = new Date(year+1,11,31);
    const list = holidayJp.between(start, end);
    const map = new Map(list.map(h => [h.date.toDateString(), h.name]));
    return map;
  }, [year]);

  return (
    <Calendar
      onChange={onChange}
      value={value}
      tileClassName={({ date }) => {
        const key = date.toDateString();
        return holidays.has(key) ? "holiday-tile" : undefined;
      }}
      tileContent={({ date }) => {
        const key = date.toDateString();
        const name = holidays.get(key);
        return name ? <span className="holiday-label">{name}</span> : null;
      }}
    />
  );
}
