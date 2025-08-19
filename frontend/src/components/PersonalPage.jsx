import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import Holidays from "date-holidays";

const hd = new Holidays("JP"); // 日本の祝日

export default function PersonalPage() {
  const [date, setDate] = useState(new Date());
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [timeslot, setTimeslot] = useState("全日");
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    axios.get("/api/schedules").then(res => setSchedules(res.data));
  }, []);

  const handleSave = () => {
    axios.post("/api/schedules", {
      title,
      memo,
      date: date.toISOString().split("T")[0],
      timeslot,
      range_mode: "single",
      username: "me",
      linkid: null
    }).then(res => {
      setSchedules([...schedules, res.data]);
      setTitle("");
      setMemo("");
    });
  };

  // 日付ごとの祝日情報
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const holiday = hd.isHoliday(date);
      if (holiday) {
        return <p className="text-red-500 text-xs">{holiday[0].name}</p>;
      }
    }
    return null;
  };

  // 祝日の見た目
  const tileClassName = ({ date, view }) => {
    if (view === "month" && hd.isHoliday(date)) {
      return "bg-red-100";
    }
    return null;
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-[#004CA0]">個人スケジュール</h2>
      <Calendar
        onChange={setDate}
        value={date}
        tileContent={tileContent}
        tileClassName={tileClassName}
      />
      <div className="mt-4">
        <input className="border p-2 w-full" placeholder="タイトル" value={title} onChange={e=>setTitle(e.target.value)} />
        <textarea className="border p-2 w-full mt-2" placeholder="メモ" value={memo} onChange={e=>setMemo(e.target.value)} />
        <select className="border p-2 w-full mt-2" value={timeslot} onChange={e=>setTimeslot(e.target.value)}>
          <option>全日</option>
          <option>昼</option>
          <option>夜</option>
          <option>時間指定</option>
        </select>
        <button onClick={handleSave} className="bg-[#FDB9C8] px-4 py-2 rounded-xl mt-2">登録</button>
      </div>
      <ul className="mt-6">
        {schedules.map(s => (
          <li key={s.id} className="border-b py-2">{s.date} {s.title} ({s.timeslot})</li>
        ))}
      </ul>
    </div>
  );
}
