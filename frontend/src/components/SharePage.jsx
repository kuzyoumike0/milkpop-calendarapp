import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function SharePage() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState("");
  const [username, setUsername] = useState("");
  const [editEventId, setEditEventId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const fetchEvents = (selectedDate) => {
    const formattedDate = formatDate(selectedDate);
    axios
      .get(`/api/shared?date=${formattedDate}`)
      .then((res) => setEvents(res.data))
      .catch((err) => console.error("イベント取得エラー:", err));
  };

  useEffect(() => {
    fetchEvents(date);
  }, [date]);

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
      .then(() => {
        setNewEvent("");
        fetchEvents(date);
      })
      .catch((err) => console.error("イベント登録エラー:", err));
  };

  const startEdit = (event) => {
    setEditEventId(event.id);
    setEditTitle(event.title);
  };

  const handleEditEvent = (id) => {
    if (!editTitle.trim() || !username.trim()) return;

    axios
      .put(`/api/shared/${id}`, { title: editTitle, username })
      .then(() => {
        setEditEventId(null);
        setEditTitle("");
        fetchEvents(date);
      })
      .catch((err) => alert("編集権限がありません"));
  };

  const handleDeleteEvent = (id) => {
    if (!window.confirm("本当に削除しますか？")) return;
    if (!username.trim()) return;

    axios
      .delete(`/api/shared/${id}`, { data: { username } })
      .then(() => fetchEvents(date))
      .catch((err) => alert("削除権限がありません"));
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>共有ページ</h1>
      <p style={styles.subtitle}>予定を登録した本人のみ編集・削除できます</p>

      {/* ユーザー名入力 */}
      <div style={styles.usernameBox}>
        <input
          type="text"
          placeholder="ユーザー名を入力"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
        />
      </div>

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
          追加
        </button>
      </form>

      {/* イベント一覧 */}
      <ul style={styles.eventList}>
        {events.length > 0 ? (
          events.map((event) => (
            <li key={event.id} style={styles.eventItem}>
              {editEventId === event.id ? (
                <>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    style={styles.input}
                  />
                  <button
                    onClick={() => handleEditEvent(event.id)}
                    style={styles.saveButton}
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setEditEventId(null)}
                    style={styles.cancelButton}
                  >
                    キャンセル
                  </button>
                </>
              ) : (
                <>
                  <span>
                    {event.title}（by {event.username}）
                  </span>
                  {event.username === username && (
                    <>
                      <button
                        onClick={() => startEdit(event)}
                        style={styles.editButton}
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        style={styles.deleteButton}
                      >
                        削除
                      </button>
                    </>
                  )}
                </>
              )}
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
  usernameBox: { textAlign: "center", marginBottom: "15px" },
  dateTitle: { marginTop: "20px", fontSize: "1.2rem", color: "#444" },
  form: { display: "flex", justifyContent: "center", margin: "20px 0", gap: "10px" },
  input: { padding: "8px", fontSize: "1rem", border: "1px solid #ccc", borderRadius: "6px" },
  addButton: { padding: "8px 16px", background: "#2196F3", color: "white", border: "none", borderRadius: "6px" },
  saveButton: { marginLeft: "8px", padding: "6px 12px", background: "#4CAF50", color: "white", border: "none", borderRadius: "6px" },
  cancelButton: { marginLeft: "8px", padding: "6px 12px", background: "#9E9E9E", color: "white", border: "none", borderRadius: "6px" },
  editButton: { marginLeft: "12px", padding: "6px 12px", background: "#FFC107", color: "white", border: "none", borderRadius: "6px" },
  deleteButton: { marginLeft: "8px", padding: "6px 12px", background: "#F44336", color: "white", border: "none", borderRadius: "6px" },
  eventList: { listStyle: "none", padding: 0, marginTop: "10px" },
  eventItem: { padding: "10px", background: "#f1f1f1", borderRadius: "6px", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  noEvent: { color: "#888", fontStyle: "italic" },
};
