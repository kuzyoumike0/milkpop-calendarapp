import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function RegisterPage() {
  const [date, setDate] = useState(new Date());
  const [timemode, setTimemode] = useState("終日");
  const [starthour, setStarthour] = useState(1);
  const [endhour, setEndhour] = useState(24);
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");

  const createLink = () => {
    const schedules = [
      { date, timemode, starthour, endhour, title },
    ];
    axios.post("/api/create-link", { schedules }).then((res) => {
      setLink(`${window.location.origin}/share/${res.data.linkid}`);
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>日程登録ページ</h2>
      <Calendar value={date} onChange={setDate} />
      <div>
        <label>タイトル: </label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <label>時間帯: </label>
        <select value={timemode} onChange={(e) => setTimemode(e.target.value)}>
          <option>終日</option>
          <option>昼</option>
          <option>夜</option>
          <option>時間指定</option>
        </select>
      </div>
      {timemode === "時間指定" && (
        <>
          <label>開始: </label>
          <select value={starthour} onChange={(e) => setStarthour(e.target.value)}>
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i + 1}>{i + 1}</option>
            ))}
          </select>
          <label>終了: </label>
          <select value={endhour} onChange={(e) => setEndhour(e.target.value)}>
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i + 1}>{i + 1}</option>
            ))}
          </select>
        </>
      )}
      <button onClick={createLink}>共有リンク作成</button>

      {link && (
        <div>
          <p>共有リンク:</p>
          <a href={link} target="_blank" rel="noreferrer">{link}</a>
        </div>
      )}
    </div>
  );
}
