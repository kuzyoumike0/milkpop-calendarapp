// frontend/src/components/SharePage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const SharePage = () => {
  const { id } = useParams();
  const [schedule, setSchedule] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem(id);
    if (data) {
      setSchedule(JSON.parse(data));
    }
  }, [id]);

  if (!schedule) {
    return <p>この共有リンクは存在しません。</p>;
  }

  return (
    <div className="page-container">
      <h2 className="page-title">共有ページ</h2>
      <p>モード: {schedule.mode === "range" ? "範囲選択" : "複数選択"}</p>
      <ul>
        {schedule.selectedDates.map((d, i) => (
          <li key={i}>{new Date(d).toLocaleDateString()}</li>
        ))}
      </ul>
    </div>
  );
};

export default SharePage;
