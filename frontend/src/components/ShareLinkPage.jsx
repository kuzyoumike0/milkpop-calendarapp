import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function SharedLinkPage() {
  const { id } = useParams();
  const [events, setEvents] = useState([]);
  const [username, setUsername] = useState("");
  const [responses, setResponses] = useState({}); // {eventId: {status, category, startTime, endTime}}
  const [participants, setParticipants] = useState({}); // {eventId: [{username, category, startTime, endTime}]}

  // デモデータ取得
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`/api/shared/${id}`);
        const sorted = res.data.events.sort((a, b) => new Date(a.date) - new Date(b.date));
        setEvents(sorted);
        setParticipants(res.data.participants || {});
      } catch (err) {
        console.error(err);
        // fallback デモデータ
        setEvents([
          { id: 1, title: "会議", date: "2025-08-21" },
          { id: 2, title: "懇親会", date: "2025-08-22" }
        ]);
        setParticipants({
          1: [{ username: "太郎", category: "昼", startTime: "13:00", endTime: "15:00" }],
          2: [{ username: "花子", category: "夜", startTime: "19:00", endTime: "21:00" }]
        });
      }
    };
    fetchEvents();
  }, [id]);

  const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

  const handleResponseChange = (eventId, field, value) => {
    setResponses((prev) => ({
      ...prev,
      [eventId]: { ...prev[eventId], [field]: value }
    }));
  };

  const handleSave = async () => {
    if (!username) {
      alert("ユーザー名を入力してください");
      return;
    }

    const payload = {
      username,
      responses
    };

    try {
      await axios.post(`/api/shared/${id}/join`, payload);
      alert("参加状況を保存しました！");
    } catch (err) {
      console.error(err);
      alert("保存に失敗しました（デモモード）");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📅 共有スケジュール ({id})</h2>

      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="ユーザー名を入力"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      {events.map((ev) => (
        <div key={ev.id} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "15px" }}>
          <h3>{ev.date} - {ev.title}</h3>

          {/* 参加選択 */}
          <div>
            <label>
              <input
                type="radio"
                name={`status-${ev.id}`}
                value="none"
                checked={responses[ev.id]?.status === "none"}
                onChange={(e) => handleResponseChange(ev.id, "status", e.target.value)}
              />
              不参加
            </label>
            <label style={{ marginLeft: "10px" }}>
              <input
                type="radio"
                name={`status-${ev.id}`}
                value="join"
                checked={responses[ev.id]?.status === "join"}
                onChange={(e) => handleResponseChange(ev.id, "status", e.target.value)}
              />
              参加
            </label>
          </div>

          {/* 参加時の詳細 */}
          {responses[ev.id]?.status === "join" && (
            <div style={{ marginTop: "10px" }}>
              区分:{" "}
              <select
                value={responses[ev.id]?.category || ""}
                onChange={(e) => handleResponseChange(ev.id, "category", e.target.value)}
              >
                <option value="">選択してください</option>
                <option value="終日">終日</option>
                <option value="昼">昼</option>
                <option value="夜">夜</option>
              </select>
              <br />
              時間:{" "}
              <select
                value={responses[ev.id]?.startTime || ""}
                onChange={(e) => handleResponseChange(ev.id, "startTime", e.target.value)}
              >
                <option value="">開始</option>
                {hours.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>{" "}
              〜{" "}
              <select
                value={responses[ev.id]?.endTime || ""}
                onChange={(e) => handleResponseChange(ev.id, "endTime", e.target.value)}
              >
                <option value="">終了</option>
                {hours.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          )}

          {/* 参加者一覧 */}
          <div style={{ marginTop: "10px" }}>
            <strong>参加者:</strong>
            <ul>
              {(participants[ev.id] || []).map((p, i) => (
                <li key={i}>
                  {p.username} ({p.category}, {p.startTime}〜{p.endTime})
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}

      <button onClick={handleSave}>保存</button>
    </div>
  );
}
