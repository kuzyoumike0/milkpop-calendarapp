import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function SharePage() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState("");
  const [editEventId, setEditEventId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  // 日付フォーマット関数
  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // イベント取得
  const fetchEvents = (selectedDate) => {
    const formattedDate = formatDate(selectedDate);
    axios
      .get(`/api/shared?date=${formattedDate}`)
      .then((res) => setEvents(res.data))
      .catch((err) => console.error("イベント取得エラー:", err));
  };

  // 初期ロード & 日付変更時
  useEffect(() => {
    fetchEvents(date);
  }, [date]);

  // イベント登録
  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!newEvent.trim()) return;

    const formattedDate = formatDate(date);

    axios
      .post("/api/shared", {
        date: formattedDate,
        title: newEvent,
      })
      .then(() => {
        setNewEvent("");
        fetchEvents(date); // 再取得
      })
      .catch((err) => console.error("イベント登録エラー:", err));
  };

  // イベント編集開始
  const startEdit = (event) => {
    setEditEventId(event.id);
    setEditTitle(event.title);
  };

  // イベント編集確定
  const handleEditEvent = (id) => {
    if (!editTitle.trim()) return;

    axios
      .put(`/api/shared/${id}`, { title: editTitle })
      .then(() => {
        setEditEventId(null);
        setEditTitle("");
        fetchEvents(date);
      })
      .catch((err) => console.error("イベント編集エラー:", err));
  };

  // イベント削除
  const handleDeleteEvent = (id) => {
    if (!window.confirm("本当に削除しますか？")) return;

    axios
      .delete(`/api/shared/${id}`)
      .then(() => {
        fetchEvents(date);
      })
      .catch((err) => console.error("イベント削除エラー:", err));
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>共有ページ</h1>
      <p style={styles.subtitle}>カレンダーから日付を選び、予定を確認・追加・編集・削除できます</p>

      {/* カレンダー */}
      <Calendar onChange={setDate} value={date} />

      {/* 選択日表示 */}
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
                  <span>{event.title}</span>
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
  form: {
    display: "flex",
    justifyContent: "center",
    margin: "20px 0",
    gap: "10px",
  },
  input: {
    flex: 1,
    padding: "8px",
    fontSize: "1rem",
    border: "1px solid #ccc",
    borderRadius: "6px",
  },
  addButton: {
    padding: "8px 16px",
    fontSize: "1rem",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    background: "#2196F3",
    color: "white",
  },
  saveButton: {
    marginLeft: "8px",
    padding: "6px 12px",
    fontSize: "0.9rem",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    background: "#4CAF50",
    color: "white",
  },
  cancelButton: {
    marginLeft: "8px",
    padding: "6px 12px",
    fontSize: "0.9rem",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    background: "#9E9E9E",
    color: "white",
  },
  editButton: {
    marginLeft: "12px",
    padding: "6px 12px",
    fontSize: "0.9rem",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    background: "#FFC107",
    color: "white",
  },
  deleteButton: {
    marginLeft: "8px",
    padding: "6px 12px",
    fontSize: "0.9rem",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    background: "#F44336",
    color: "white",
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
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  noEvent: {
    color: "#888",
    fontStyle: "italic",
  },
};
