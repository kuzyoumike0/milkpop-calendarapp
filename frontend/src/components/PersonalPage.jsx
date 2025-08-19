import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function PersonalPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [mode, setMode] = useState("range");
  const [dates, setDates] = useState(new Date());
  const [timeslot, setTimeslot] = useState("終日");

  return (
    <div style={{ padding: "20px" }}>
      <h2>個人日程登録</h2>
      <input placeholder="タイトル" value={title} onChange={(e) => setTitle(e.target.value)} />
      <br />
      <textarea placeholder="メモ" value={memo} onChange={(e) => setMemo(e.target.value)} />
      <h3>カレンダー</h3>
      <Calendar
        selectRange={mode === "range"}
        onChange={setDates}
        value={dates}
      />
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
      <h3>入力内容</h3>
      <p>タイトル: {title}</p>
      <p>メモ: {memo}</p>
      <p>日付: {JSON.stringify(dates)}</p>
      <p>時間帯: {timeslot}</p>
    </div>
  );
}
