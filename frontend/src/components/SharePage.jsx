import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:8080"); // バックエンドURL

export default function SharePage() {
  const navigate = useNavigate();
  const [shareId, setShareId] = useState(null);
  const [events, setEvents] = useState([]);

  // 入力フォーム用 state
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("終日");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("18:00");

  // 共有リンク発行
  const createShare = async () => {
    const res = await axios.post("/api/createShare");
    setShareId(res.data.shareId);
    navigate(`/share/${res.data.shareId}`);
  };

  useEffect(() => {
    if (!shareId) return;

    axios.get(`/api/${shareId}/events`).then(res => setEvents(res.data));

    socket.emit("joinShare", shareId);

    socket.on("eventAdded", (event) => {
      setEvents(prev => [...prev, event]);
    });

    socket.on("eventUpdated", (updated) => {
      setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
    });

    socket.on("eventDeleted", (id) => {
      setEvents(prev => prev.filter(e => e.id !== id));
    });

    return () => {
      socket.off("eventAdded");
      socket.off("eventUpdated");
      socket.off("eventDeleted");
    };
  }, [shareId]);

  // イベント追加
  const addEvent = async () => {
    if (!title || !date) {
      alert("タイトルと日付は必須です");
      return;
    }
    const newEvent = { title, date, category, start, end };
    await axios.post(`/api/${shareId}/events`, newEvent);
    setTitle("");
  };

  // イベント削除
  const deleteEvent = async (id) => {
    await axios.delete(`/api/${shareId}/events/${id}`);
  };

  // イベント編集
  const editEvent = async (id) => {
    await axios.put(`/api/${shareId}/events/${id}`, { title: "編集済み" });
  };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "20px" }}>
      <h2>📢 共有カレンダー作成</h2>
      <button onClick={createShare}>共有リンクを発行</button>

      {shareId && (
        <div style={{ marginTop: "20px" }}>
          <h3>発行されたリンク</h3>
          <p><a href={`/share/${shareId}`} target="_blank" rel="noreferrer">
            {window.location.origin}/share/{shareId}
          </a></p>

          {/* 入力フォーム */}
          <div style={{ border: "1px solid #ccc", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
            <h3>イベント追加</h3>
            <div style={{ marginBottom: "10px" }}>
              <label>タイトル：</label>
              <input value={title} onChange={e => setTitle(e.target.value)} style={{ width: "100%" }} />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label>日付：</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label>区分：</label>
              <label><input type="radio" value="終日" checked={category === "終日"} onChange={e => setCategory(e.target.value)} />終日</label>
              <label style={{ marginLeft: "10px" }}><input type="radio" value="昼" checked={category === "昼"} onChange={e => setCategory(e.target.value)} />昼</label>
              <label style={{ marginLeft: "10px" }}><input type="radio" value="夜" checked={category === "夜"} onChange={e => setCategory(e.target.value)} />夜</label>
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label>開始：</label>
              <input type="time" value={start} onChange={e => setStart(e.target.value)} />
              <label style={{ marginLeft: "15px" }}>終了：</label>
              <input type="time" value={end} onChange={e => setEnd(e.target.value)} />
            </div>
            <button onClick={addEvent}>追加</button>
          </div>

          {/* 登録済みイベント */}
          <h3>登録済みイベント</h3>
          <ul>
            {events.sort((a, b) => (a.date > b.date ? 1 : -1)).map(event => (
              <li key={event.id} style={{ marginBottom: "10px" }}>
                <b>{event.title}</b>  
                （{event.date} | {event.category} | {event.start} - {event.end}）
                <button onClick={() => editEvent(event.id)} style={{ marginLeft: "10px" }}>編集</button>
                <button onClick={() => deleteEvent(event.id)} style={{ marginLeft: "5px" }}>削除</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
