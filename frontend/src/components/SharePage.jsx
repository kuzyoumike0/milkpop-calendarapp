import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Holidays from "date-holidays";
import axios from "axios";

export default function SharePage() {
  const { linkid } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [username, setUsername] = useState("");
  const [response, setResponse] = useState("〇");
  const [responses, setResponses] = useState([]);

  const hd = new Holidays("JP");
  const holidays = hd.getHolidays(new Date().getFullYear()).map(h => h.date);
  const isHoliday = (date) => holidays.includes(date.toISOString().split("T")[0]);

  useEffect(() => {
    axios.get(`/api/share/${linkid}`).then((res) => {
      setSchedule(res.data[0]);
    });
  }, [linkid]);

  const save = async () => {
    if (!schedule) return;
    const res = await axios.post("/api/responses", {
      schedule_id: schedule.id,
      username,
      response,
    });
    setResponses(res.data);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>共有ページ</h2>
      {schedule && (
        <div>
          <p>タイトル: {schedule.title}</p>
          <p>日付: {schedule.start_date} 〜 {schedule.end_date}</p>
          <p>時間帯: {schedule.timeslot}</p>
          <Calendar
            value={[new Date(schedule.start_date), new Date(schedule.end_date)]}
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
        </div>
      )}
      <input placeholder="名前" value={username} onChange={(e) => setUsername(e.target.value)} />
      <select value={response} onChange={(e) => setResponse(e.target.value)}>
        <option>〇</option>
        <option>✖</option>
      </select>
      <button onClick={save}>保存</button>

      <h3>参加状況</h3>
      <ul>
        {responses.map((r, idx) => (
          <li key={idx}>{r.username} : {r.response}</li>
        ))}
      </ul>
    </div>
  );
}
