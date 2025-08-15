import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function PersonalCalendar() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null); // モーダル表示用

  // 月単位で予定を取得
  useEffect(() => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");

    axios
      .get(`/api/personal/1?month=${yyyy}-${mm}`)
      .then((res) => setEvents(res.data))
      .catch((err) => console.error("Error fetching events:", err));
  }, [date]);

  // カレンダーの日付ごとの中身
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const formattedDate = `${yyyy}-${mm}-${dd}`;

      const dayEvents = events.filter((e) => e.date === formattedDate);

      return (
        <ul style={{ paddingLeft: "5px", fontSize: "0.7em", margin: 0 }}>
          {dayEvents.map((e) => (
            <li
              key={e.id}
              style={{ cursor: "pointer", listStyle: "none" }}
              onClick={(ev) => {
                ev.stopPropagation(); // 日付選択イベントを抑制
                setSelectedEvent(e);
              }}
            >
              {e.time_slot} {e.title}
            </li>
          ))}
        </ul>
      );
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "20px auto", fontFamily: "sans-serif" }}>
      <h2>個人カレンダー</h2>
      <Calendar value={date} onChange={setDate} tileContent={tileContent} />

      {/* モーダル */}
      {selectedEvent && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
          onClick={() => setSelectedEvent(null)}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "8px",
              maxWidth: "400px",
              width: "100%",
              boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()} // モーダル内クリックで閉じない
          >
            <h3>{selectedEvent.title}</h3>
            <p>
              <strong>日付:</strong> {selectedEvent.date}
            </p>
            <p>
              <strong>時間:</strong> {selectedEvent.time_slot}
            </p>
            <p>
              <strong>詳細:</strong> {selectedEvent.description || "説明なし"}
            </p>
            <button
              onClick={() => setSelectedEvent(null)}
              style={{
                background: "#007bff",
                color: "#fff",
                padding: "8px 16px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
