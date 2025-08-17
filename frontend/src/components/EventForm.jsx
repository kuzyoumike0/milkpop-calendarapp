import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function EventForm() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [timeslot, setTimeslot] = useState("全日");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("/api/schedules", { title, date, timeslot });
    navigate("/");
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>予定追加</h2>
      <label>日付: <input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label><br/>
      <label>予定: <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} /></label><br/>
      <label>区分:
        <select value={timeslot} onChange={(e) => setTimeslot(e.target.value)}>
          <option>全日</option>
          <option>昼</option>
          <option>夜</option>
        </select>
      </label><br/>
      <button type="submit">追加</button>
    </form>
  );
}