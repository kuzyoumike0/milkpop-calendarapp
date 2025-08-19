import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ShareLinkPage() {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    axios.get("/api/schedules").then(res => setSchedules(res.data));
  }, []);

  return (
    <div>
      <h2 className="text-2xl">発行されたリンク一覧</h2>
      <ul>
        {schedules.map(s => (
          <li key={s.id}>
            {s.title} - <a href={`/share/${s.linkid}`} className="text-blue-400">リンク</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
