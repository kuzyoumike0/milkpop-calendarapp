import React, { useState, useEffect } from "react";

export default function SharedSchedule() {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    fetch("/api/schedules")
      .then(res => res.json())
      .then(data => setSchedules(data));
  }, []);

  return (
    <div>
      <h2 className="text-2xl text-secondary mb-4">共有スケジュール</h2>
      <ul className="space-y-2">
        {schedules.map(s => (
          <li key={s.id} className="bg-elegantBlack p-3 rounded border border-primary">
            <strong>{s.title}</strong> ({s.date})<br />
            {s.username} - {s.time_slot}<br />
            {s.memo}
          </li>
        ))}
      </ul>
    </div>
  );
}
