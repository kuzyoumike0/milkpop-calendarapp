import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import ShareButton from "./ShareButton";
import Holidays from "date-holidays";

const hd = new Holidays("JP");

export default function SharePage() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date());
  const [timeslot, setTimeslot] = useState("全日");
  const [link, setLink] = useState("");

  const handleSave = () => {
    axios.post("/api/share").then(res => setLink(res.data.url));
  };

  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const holiday = hd.isHoliday(date);
      if (holiday) {
        return <p className="text-red-500 text-xs">{holiday[0].name}</p>;
      }
    }
    return null;
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month" && hd.isHoliday(date)) {
      return "bg-red-100";
    }
    return null;
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-[#004CA0]">日程登録ページ</h2>
      <Calendar
        onChange={setDate}
        value={date}
        tileContent={tileContent}
        tileClassName={tileClassName}
      />
      <input className="border p-2 w-full mt-2" placeholder="タイトル" value={title} onChange={e=>setTitle(e.target.value)} />
      <select className="border p-2 w-full mt-2" value={timeslot} onChange={e=>setTimeslot(e.target.value)}>
        <option>全日</option>
        <option>昼</option>
        <option>夜</option>
      </select>
      <button onClick={handleSave} className="bg-[#FDB9C8] px-4 py-2 rounded-xl mt-2">共有リンク発行</button>
      {link && <ShareButton link={link} />}
    </div>
  );
}
