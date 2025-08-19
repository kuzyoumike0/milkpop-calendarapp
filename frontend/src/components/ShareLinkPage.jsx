import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function ShareLinkPage() {
  const { id } = useParams();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios
      .get(`/api/sharelink/${id}`)
      .then((res) => setEvents(res.data))
      .catch((err) => console.error("共有リンク取得エラー:", err));
  }, [id]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>共有スケジュール</h1>
      <p style={styles.subtitle}>リンクID: {id}</p>

      <ul style={styles.eventList}>
        {events.length > 0 ? (
          events.map((event) => (
            <li key={event.id} style={styles.eventItem}>
              <strong>{event.date}</strong> - {event.title}（{event.time_info}）
              <br />
              <span style={styles.user}>by {event.username}</span>
            </li>
          ))
        ) : (
          <li style={styles.noEvent}>予定はありません</li>
        )}
      </ul>
    </div>
  );
}

const styles = {
  container: { maxWidth: "800px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" },
  title: { textAlign: "center", fontSize: "2rem", marginBottom: "10px", color: "#333" },
  subtitle: { textAlign: "center", fontSize: "1rem", marginBottom: "20px", color: "#666" },
  eventList: { listStyle: "none", padding: 0, marginTop: "20px" },
  eventItem: { padding: "10px", background: "#f1f1f1", borderRadius: "6px", marginBottom: "8px" },
  user: { fontSize: "0.9rem", color: "#555" },
  noEvent: { color: "#888", fontStyle: "italic" },
};
