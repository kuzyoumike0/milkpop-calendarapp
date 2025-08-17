
import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function PersonalSchedule(){
  const [value, setValue] = useState(new Date());
  return (
    <div className="space-y-6">
      <div className="glass p-6">
        <h2 className="text-xl font-bold mb-4 text-primary">個人スケジュール</h2>
        <Calendar onChange={setValue} value={value} />
        <div className="mt-4 text-white/80">選択日：{value.toLocaleDateString('ja-JP')}</div>
      </div>
    </div>
  )
}
