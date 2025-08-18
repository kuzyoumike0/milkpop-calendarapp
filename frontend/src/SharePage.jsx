import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function SharePage() {
  const { id } = useParams();
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    axios.get(`/api/share-link/${id}`).then((res) => setSchedules(res.data));
  }, [id]);

  return (
    <div className="page">
      <h2>共有スケジュール</h2>
      {schedules.length === 0 ? (
        <p>予定がありません</p>
      ) : (
        <ul>
          {schedules
            .sort((a, b) => a.dates[0].localeCompare(b.dates[0]))
            .map((s) => (
              <li key={s.share_id}>
                <b>{s.dates.join(", ")}</b> - {s.username} ({s.title || "無題"})
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
