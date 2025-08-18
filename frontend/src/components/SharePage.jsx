import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function SharePage() {
  const [date, setDate] = useState(new Date());
  const [newEvent, setNewEvent] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // イベント登録 & 新しいリンク発行
  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!newEvent.trim() || !username.trim()) return;

    const formattedDate = formatDate(date);

    axios
      .post("/api/shared", {
        date: formattedDate,
        title: newEvent,
        username,
      })
      .then((res) => {
        const linkId = res.data.linkId;
        navigate(`/sharelink/${linkId}`); // 新しいリンクページに遷移
      })
      .catch((err) => console.error("イベント登録エラー:", err));
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>共有ページ</h1>
      <p style={styles.subtitle}>予定を登録すると共有リンクが発行されます</p>

      {/* ユーザー名 */}
      <input
        type="text"
        placeholder="ユーザー名"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={styles.input}
      />

      {/* カレンダー */}
      <Calendar onChange={setDate} value={date} />
      <h2 style={styles.dateTitle}>選択日: {formatDate(date)}</h2>

      {/* 予定追加フォーム */}
      <form style={styles.form} onSubmit={handleAddEvent}>
        <input
          type="text"
          placeholder="予定を入力"
          value={newEvent}
          onChange={(e) => setNewEvent(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.addButton}>
          共有リンクを発行
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: { maxWidth: "800px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" },
  title: { textAlign: "center", fontSize: "2rem", marginBottom: "10px", color: "#333" },
  subtitle: { textAlign: "center", fontSize: "1rem", marginBottom: "20px", color: "#666" },
  dateTitle: { marginTop: "20px", fontSize: "1.2rem", color: "#444" },
  form: { display: "flex", justifyContent: "center", margin: "20px 0", gap: "10px" },
  input: { padding: "8px", fontSize: "1rem", border: "1px solid #ccc", borderRadius: "6px" },
  addButton: { padding: "8px 16px", background: "#2196F3", color: "white", border: "none", borderRadius: "6px" },
};
