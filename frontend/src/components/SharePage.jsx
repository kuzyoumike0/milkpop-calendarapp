import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../index.css";

const SharedPage = () => {
  const { id } = useParams();
  const [schedules, setSchedules] = useState(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      const res = await fetch(`/api/schedules/${id}`);
      const data = await res.json();
      if (data.ok) {
        setSchedules(data.schedules);
      } else {
        setSchedules([]);
      }
    };
    fetchSchedules();
  }, [id]);

  if (schedules === null) {
    return <p>読み込み中...</p>;
  }

  if (schedules.length === 0) {
    return <p>共有リンクが存在しません</p>;
  }

  return (
    <div className="page-container">
      <h2 className="page-title">共有スケジュール</h2>

      <div className="schedule-section">
        {schedules.map((s, idx) => (
          <div key={idx} className="schedule-item">
            <span>{new Date(s.date).toLocaleDateString()}</span>
            <span>{s.type}</span>
            {s.type === "時間指定" && (
              <span>
                {s.start} 〜 {s.end}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SharedPage;
