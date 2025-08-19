import React, { useState } from "react";
import axios from "axios";
import CalendarWithHolidays from "./CalendarWithHolidays";
import { useNavigate } from "react-router-dom";

export default function LinkPage() {
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [timeslot, setTimeslot] = useState("終日");
  const navigate = useNavigate();

  const createLink = async () => {
    const res = await axios.post("/api/schedule", {
      title, dates: selectedDates, timeslot
    });
    navigate(`/sharelink/${res.data.linkId}`);
  };

  return (
    <div>
      <h2>日程登録</h2>
      <input placeholder="タイトル" value={title} onChange={e=>setTitle(e.target.value)} /><br/>
      <CalendarWithHolidays onSelectDates={setSelectedDates} />
      <label>
        時間帯:
        <select value={timeslot} onChange={e=>setTimeslot(e.target.value)}>
          <option>終日</option>
          <option>昼</option>
          <option>夜</option>
          <option>時間指定</option>
        </select>
      </label><br/>
      <button onClick={createLink}>共有リンク発行</button>
    </div>
  );
}
