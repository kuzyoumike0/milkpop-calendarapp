import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Holidays from "date-holidays";

export default function PersonalPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [mode, setMode] = useState("range");
  const [dates, setDates] = useState(new Date());
  const [timeslot, setTimeslot] = useState("終日");

  const hd = new Holidays("JP");
  const holidays = hd.getHolidays(new Date().getFullYear()).map(h => h.date);

  const isHoliday = (date) => {
    const ymd = date.toISOString().split("T")[0];
    return holidays.includes(ymd);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>個人日程登録</h2>
      <input placeholder="タイトル" value={title} onChange={(e) => setTitle(e.target.value)} />
      <br />
      <textarea placeholder="メモ" value={memo} onChange={(e) => setMemo(e.target.value)} />
      <h3>カレンダー（祝日対応）</h3>
      <Calendar
        selectRange={mode === "range"}
        onChange={setDates}
        value={dates}
        tileClassName={({ date, view }) =>
          view === "month" && isHoliday(date) ? "holiday" : null
        }
      />
      <style>
        {`
          .holiday {
            background: #FDB9C8 !important;
            color: #fff !important;
            border-radius: 50%;
          }
        `}
      </style>
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
