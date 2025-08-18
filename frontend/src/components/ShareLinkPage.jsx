import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io(); // 同一サーバーに接続

export default function SharedLinkPage() {
  const { shareId } = useParams();
  const [events, setEvents] = useState([]);

  // 初期取得
  useEffect(() => {
    axios.get(`/api/events/${shareId}`).then(res => setEvents(res.data));
  }, [shareId]);

  // リアルタイム更新
  useEffect(() => {
    socket.on("eventUpdated", (data) => {
      if (data.shareId === shareId) {
        setEvents(data.events);
      }
    });
    return () => socket.off("eventUpdated");
  }, [shareId]);

  return (
    <div>
      <h2>共有カレンダー (ID: {shareId})</h2>
      <ul>
        {events.map(ev => (
          <li key={ev.id}>{ev.date} : {ev.title}</li>
        ))}
      </ul>
    </div>
  );
}
