import React, { useState, useEffect } from "react";
import axios from "axios";
import CalendarWithHolidays from "./CalendarWithHolidays";

export default function PersonalPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [timeslot, setTimeslot] = useState("終日");
  const [list, setList] = useState([]);

  const save = async () => {
    const res = await axios.post("/api/personal", {
      title, memo, dates: selectedDates, timeslot
    });
    setList(res.data);
  };

  useEffect(() => {
    axios.get("/api/personal").then(res => setList(res.data));
  }, []);

  return (
    <div>
      <h2>個人日程登録</h2>
      <input placeholder="タイトル" value={title} onChange={e => setTitle(e.target.value)} /><br/>
      <textarea placeholder="メモ" value={memo} onChange={e => setMemo(e.target.value)} /><br/>
      <CalendarWithHolidays onSelectDates={setSelectedDates} />
      <label>
        時間帯:
        <select value={timeslot} onChange={e => setTimeslot(e.target.value)}>
          <option>終日</option>
          <option>昼</option>
          <option>夜</option>
          <option>時間指定</option>
        </select>
      </label><br/>
      <button onClick={save}>登録</button>

      <h3>登録済み</h3>
      <ul>
        {list.map((p,i)=><li key={i}>{p.title} ({p.timeslot}) {p.memo}</li>)}
      </ul>
    </div>
  );
}
