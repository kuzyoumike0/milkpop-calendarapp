import React, { useState } from "react";
import axios from "axios";

export default function PersonalPage() {
  const [title, setTitle] = useState("");
  const [user, setUser] = useState("");
  const [date, setDate] = useState("");
  const [timeStart, setTimeStart] = useState("");
  const [timeEnd, setTimeEnd] = useState("");

  const submit = async () => {
    await axios.post("/api/personal", { title, user, date, timeStart, timeEnd });
    alert("登録しました");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>個人スケジュール</h1>
      <input placeholder="ユーザー名" value={user} onChange={(e) => setUser(e.target.value)} />
      <input placeholder="予定タイトル" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <input type="time" value={timeStart} onChange={(e) => setTimeStart(e.target.value)} />
      <input type="time" value={timeEnd} onChange={(e) => setTimeEnd(e.target.value)} />
      <button onClick={submit}>登録</button>
    </div>
  );
}
