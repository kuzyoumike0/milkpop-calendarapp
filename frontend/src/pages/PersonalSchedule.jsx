import React, { useState } from "react";
import CustomCalendar from "../components/CustomCalendar";

export default function PersonalSchedule(){
  const [date, setDate] = useState(new Date());
  return (
    <div className="glass p-6 space-y-4">
      <h2 className="text-xl font-bold text-primary">個人スケジュール</h2>
      <CustomCalendar value={date} onChange={setDate} />
      <div className="text-white/80">選択日：{date.toLocaleDateString('ja-JP')}</div>
    </div>
  )
}
