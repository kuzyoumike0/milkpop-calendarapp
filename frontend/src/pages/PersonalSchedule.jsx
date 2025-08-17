import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function PersonalSchedule() {
  return (
    <div className="p-4 bg-white/30 rounded-2xl shadow-xl">
      <h1 className="text-xl font-bold mb-4">個人スケジュール</h1>
      <Calendar selectRange={true} />
    </div>
  );
}
