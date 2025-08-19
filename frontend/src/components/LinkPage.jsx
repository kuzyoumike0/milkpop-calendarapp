import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function LinkPage() {
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState("range");
  const [dates, setDates] = useState(new Date());
  const [timeslot, setTimeslot] = useState("終日");
  const [link, setLink] = useState("");

  const register = async () => {
    const start_date = Array.isArray(dates) ? dates[0] : dates;
    const end_date = Array.isArray(dates) ? dates[1] : dates;
    const res = await axios.post("/api/schedules", {
      title,
      memo: "",
      start_date,
      end_date,
      timeslot,
      mode,
    });
    setLink(res.data.url);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>日程登録</h2>
      <input placeholder="タイトル" value={title} onChange={(e) => setTitle(e.target.value)} />
      <Calendar selectRange={mode === "range"} onChange={setDates} value={dates} />
      <div>
        <label>
          <input type="radio" checked={mode === "range"} onChange={() => setMode("range")} />
          範囲選択
        </label>
        <label>
          <input type="radio" checked={mode === "multiple"} onChange={() => setMode("multiple")} />
          複数選択
        </label>
      </div>
      <div>
        <select value={timeslot} onChange={(e) => setTimeslot(e.target.value)}>
          <option>終日</option>
          <option>昼</option>
          <option>夜</option>
          <option>時間指定</option>
        </select>
      </div>
      <button onClick={register}>リンク発行</button>
      {link && <p>共有リンク: <a href={link}>{link}</a></p>}
    </div>
  );
}
