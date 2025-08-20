import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import useHolidays from "../hooks/useHolidays";

export default function LinkPage() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState([]);
  const [timeSlot, setTimeSlot] = useState("全日");
  const [schedules, setSchedules] = useState([]);
  const [link, setLink] = useState("");

  const holidays = useHolidays();

  const fetchSchedules = async () => {
    const res = await axios.get("/api/personal");
    setSchedules(res.data);
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleSave = async () => {
    const res = await axios.post("/api/schedules", {
      title,
      dates: Array.isArray(date) ? date : [date],
      timeslot: timeSlot,
    });
    setLink(res.data.link);
    fetchSchedules();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">日程登録</h2>
      <input
        className="p-2 mb-2 w-full text-black rounded"
        placeholder="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <Calendar
        onChange={setDate}
        value={date}
        selectRange={true}
        tileClassName={({ date }) => {
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, "0");
          const dd = String(date.getDate()).padStart(2, "0");
          const key = `${yyyy}-${mm}-${dd}`;
          return holidays[key] ? "text-red-500 font-bold" : "";
        }}
      />

      <div className="mt-2">
        <label><input type="radio" value="全日" checked={timeSlot==="全日"} onChange={(e)=>setTimeSlot(e.target.value)} /> 全日</label>
        <label><input type="radio" value="昼" checked={timeSlot==="昼"} onChange={(e)=>setTimeSlot(e.target.value)} /> 昼</label>
        <label><input type="radio" value="夜" checked={timeSlot==="夜"} onChange={(e)=>setTimeSlot(e.target.value)} /> 夜</label>
      </div>

      <button onClick={handleSave} className="mt-4 bg-[#004CA0] hover:bg-[#FDB9C8] text-white px-4 py-2 rounded-xl">保存</button>

      {link && <p className="mt-4">共有リンク: <a href={link}>{link}</a></p>}

      <h3 className="text-xl mt-6">登録済み</h3>
      <ul>
        {schedules.map((s, i) => (
          <li key={i}>{s.title} - {s.date} ({s.timeslot})</li>
        ))}
      </ul>
    </div>
  );
}
