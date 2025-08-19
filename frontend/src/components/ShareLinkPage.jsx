import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function ShareLinkPage() {
  const { linkId } = useParams();
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    axios.get(`/api/shared/${linkId}`)
      .then((res) => setSchedules(res.data))
      .catch((err) => console.error(err));
  }, [linkId]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>共有スケジュール</h2>
      {schedules.length === 0 ? (
        <p>データがありません</p>
      ) : (
        <ul>
          {schedules.map((s, i) => (
            <li key={i}>
              {s.username} : {new Date(s.schedule_date).toLocaleDateString()} ({s.mode})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
