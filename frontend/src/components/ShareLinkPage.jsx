import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function ShareLinkPage() {
  const { linkId } = useParams();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios
      .get(`/api/shared/${linkId}`)
      .then((res) => setEvents(res.data))
      .catch((err) => console.error("共有リンク取得失敗:", err));
  }, [linkId]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>共有された予定</h2>
      {events.length === 0 ? (
        <p>予定はありません</p>
      ) : (
        <ul>
          {events.map((e, i) => (
            <li key={i}>
              📅 {e.date} — 👤 {e.username} — 🏷 {e.category}
              {e.category === "custom" &&
                `（${e.starttime}～${e.endtime}）`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
