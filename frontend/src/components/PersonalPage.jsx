import React, { useState, useEffect } from "react";
import axios from "axios";

export default function PersonalPage() {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    axios.get("/api/schedules").then(res => setSchedules(res.data));
  }, []);

  return (
    <div>
      <h2 className="text-2xl">個人スケジュール一覧</h2>
      <ul className="space-y-2">
        {schedules.map(s => (
          <li key={s.id} className="border p-2 rounded">
            <strong>{s.title}</strong> ({s.start_date} ~ {s.end_date}) [{s.timeslot}]<br/>
            {s.memo}
          </li>
        ))}
      </ul>
    </div>
  );
}
