import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function SharePage() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);

  // 日付フォーマット関数
  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // 日付変更時にイベント取得
  useEffect(() => {
    const formattedDate = formatDate(date);
    axios
      .get(`/api/shared?date=${formattedDate}`)
      .then((res) => setEvents(res.data))
      .catch((err) => console.error("イベント取得エラー:", err));
  }, [date]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>共有ページ</h1>
      <p style={styles.subtitle}>カレンダーの日付をクリックして予定を確認できます</p>

      {/* カレンダー */}
      <Calendar onChange={setDate} value={date} />

      {/* 選択日表示 */}
      <h2 style={styles.dateTitle}>選択日: {formatDate(date)}</h2>

      {/* イベント一覧 */}
      <ul style={styles.eventList}>
        {events.length > 0 ? (
          events.map((event, idx) => (
            <li key={idx} style={styles.eventItem}>
              {event.title || "予定なし"}
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
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "sans-serif",
  },
  title: {
    textAlign: "center",
    fontSize: "2rem",
    marginBottom: "10px",
    color: "#333",
  },
  subtitle: {
    textAlign: "center",
    fontSize: "1rem",
    marginBottom: "20px",
    color: "#666",
  },
  dateTitle: {
    marginTop: "20px",
    fontSize: "1.2rem",
    color: "#444",
  },
  eventList: {
    listStyle: "none",
    padding: 0,
    marginTop: "10px",
  },
  eventItem: {
    padding: "10px",
    background: "#f1f1f1",
    borderRadius: "6px",
    marginBottom: "8px",
  },
  noEvent: {
    color: "#888",
    fontStyle: "italic",
  },
};
