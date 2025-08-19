import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function ShareLinkPage() {
  const { linkid } = useParams();
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    axios.get("/api/schedules").then(res => {
      setSchedules(res.data.filter(s => s.linkid === linkid));
    });
  }, [linkid]);

  return (
    <div>
      <h2 className="text-xl font-bold text-[#004CA0]">共有スケジュール</h2>
      <ul className="mt-4">
        {schedules.map(s => (
          <li key={s.id} className="border-b py-2">{s.date} {s.title} ({s.timeslot})</li>
        ))}
      </ul>
    </div>
  );
}
