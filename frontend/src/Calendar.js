import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import EventModal from "./EventModal";
import { getEvents } from "./api";

export default function MyCalendar({ token }) {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    getEvents(token).then((res) => setEvents(res.data));
  }, [token]);

  const dayEvents = events.filter(
    (e) => new Date(e.date).toDateString() === date.toDateString()
  );

  return (
    <div>
      <Calendar onChange={setDate} value={date} />
      <div style={{ marginTop: "16px" }}>
        <h3>{date.toDateString()}</h3>
        {dayEvents.map((e) => (
          <div
            key={e.id}
            style={{
              color: e.is_shared ? "green" : "blue",
              borderBottom: "1px solid #ccc",
              padding: "4px 0"
            }}
          >
            {e.title} {e.is_shared && "(共有)"}
          </div>
        ))}
        <button onClick={() => setModalOpen(true)}>予定追加</button>
      </div>
      {modalOpen && (
        <EventModal
          date={date}
          token={token}
          onClose={() => setModalOpen(false)}
          refresh={() => getEvents(token).then((res) => setEvents(res.data))}
        />
      )}
    </div>
  );
}
