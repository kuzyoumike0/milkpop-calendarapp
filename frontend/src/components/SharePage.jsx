import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function SharePage() {
  const { linkid } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [username, setUsername] = useState("");
  const [response, setResponse] = useState("〇");
  const [responses, setResponses] = useState([]);

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
