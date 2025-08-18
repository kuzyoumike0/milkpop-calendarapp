import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function SharePage() {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/api/share").then((res) => setEvents(res.data));
  }, []);

  const createLink = async () => {
    const res = await axios.post("/api/share/link");
    navigate(`/link/${res.data.id}`);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>共有カレンダー</h1>
      <ul>
        {events.map((e) => (
          <li key={e.id}>
            {e.date} {e.timeStart}〜{e.timeEnd} {e.title} ({e.user})
          </li>
        ))}
      </ul>
      <button onClick={createLink}>共有リンクを発行</button>
    </div>
  );
}
