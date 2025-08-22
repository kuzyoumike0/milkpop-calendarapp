import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const SharePage = () => {
  const { id } = useParams();
  const [schedule, setSchedule] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/schedules/${id}`);
      const data = await res.json();
      setSchedule(data);
    };
    fetchData();
  }, [id]);

  if (!schedule) return <p>読み込み中...</p>;

  return (
    <div className="page-container">
      <h2 className="page-title">共有された日程</h2>
      <ul>
        {schedule.dates.map((d, i) => (
          <li key={i}>{d}</li>
        ))}
      </ul>
    </div>
  );
};

export default SharePage;
