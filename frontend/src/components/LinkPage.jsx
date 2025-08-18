import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function LinkPage() {
  const { id } = useParams();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get(`/api/share/${id}`).then((res) => setEvents(res.data));
  }, [id]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>共有リンクの予定一覧</h1>
      <ul>
        {events
          .sort((a, b) => (a.date + a.timeStart).localeCompare(b.date + b.timeStart))
          .map((e) => (
            <li key={e.id}>
              {e.date} {e.timeStart}〜{e.timeEnd} {e.title} ({e.user})
            </li>
          ))}
      </ul>
    </div>
  );
}
