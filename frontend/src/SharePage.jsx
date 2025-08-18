import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function SharePage() {
  const { id } = useParams(); // URL の /share/:id の部分
  const [events, setEvents] = useState([]);
  const [username, setUsername] = useState("");
  const [title, setTitle] = useState("");
  const [timeslot, setTimeslot] = useState("全日");

  // イベント取得
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`/api/share/${id}`);
        // timeslot順にソート
        const sorted = [...res.data].sort((a, b) => {
          const order = { "全日": 0, "昼": 1, "夜": 2 };
          return order[a.timeslot] - order[b.timeslot];
        });
        setEvents(sorted);
      } catch (err) {
        console.error("共有リンクの予定取得エラー:", err);
      }
    };
    fetchEvents();
  }, [id]);

  // 予定追加
  const addEvent = async () => {
    if (!username || !title) {
      alert("名前と予定を入力してください");
      return;
    }
    try {
      await axios.post(`/api/share/${id}/add`, {
        username,
        timeslot,
        title,
      });
      setTitle("");
      const res = await axios.get(`/api/share/${id}`);
      const sorted = [...res.data].sort((a, b) => {
        const order = { "全日": 0, "昼": 1, "夜": 2 };
        return order[a.timeslot] - order[b.timeslot];
      });
      setEvents(sorted);
    } catch (err) {
      console.error("共有リンク経由で予定追加エラー:", err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>共有カレンダー（リンク）</h1>

      <h2>予定の追加</h2>
      <input
        type="text"
        placeholder="名前"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ marginRight: 10 }}
      />
      <input
        type="text"
        placeholder="予定"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ marginRight: 10 }}
      />
      <select
        value={timeslot}
        onChange={(e) => setTimeslot(e.target.value)}
        style={{ marginRight: 10 }}
      >
        <option value="全日">全日</option>
        <option value="昼">昼</option>
        <option value="夜">夜</option>
      </select>
      <button onClick={addEvent}>追加</button>

      <h2>予定一覧</h2>
      <ul>
        {events.map((ev) => (
          <li key={ev.id}>
            [{ev.timeslot}] {ev.username}: {ev.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
