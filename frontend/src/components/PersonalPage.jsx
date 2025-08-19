import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function PersonalPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [date, setDate] = useState(new Date());
  const [rangeMode, setRangeMode] = useState("single");
  const [timeslot, setTimeslot] = useState("全日");

  const handleSave = async () => {
    const formattedDate = date.toISOString().split("T")[0];
    await axios.post("/api/personal", {
      title,
      memo,
      date: formattedDate,
      timeslot,
      rangeMode,
    });
    alert("保存しました！");
  };

  return (
    <div>
      <h2>個人スケジュール</h2>
      <div>
        タイトル:{" "}
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        メモ: <input value={memo} onChange={(e) => setMemo(e.target.value)} />
      </div>
      <Calendar value={date} onChange={setDate} />
      <div>
        範囲選択:{" "}
        <label>
          <input
            type="radio"
            name="range"
            value="single"
            checked={rangeMode === "single"}
            onChange={() => setRangeMode("single")}
          />
          単日
        </label>
        <label>
          <input
            type="radio"
            name="range"
            value="multiple"
            checked={rangeMode === "multiple"}
            onChange={() => setRangeMode("multiple")}
          />
          複数日
        </label>
      </div>
      <div>
        時間帯:{" "}
        <select value={timeslot} onChange={(e) => setTimeslot(e.target.value)}>
          <option>全日</option>
          <option>昼</option>
          <option>夜</option>
          <option>1時-0時</option>
        </select>
      </div>
      <button onClick={handleSave}>保存</button>
    </div>
  );
}
