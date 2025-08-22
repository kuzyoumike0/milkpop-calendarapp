// frontend/src/components/SharePage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const SharePage = () => {
  const { id } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/schedules/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          setSchedule(data.schedules);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <p>読み込み中...</p>;
  if (!schedule) return <p>この共有リンクは存在しません。</p>;

  return (
    <div className="page-container">
      <h2 className="page-title">共有ページ</h2>
      <p>モード: {schedule.mode === "range" ? "範囲選択" : "複数選択"}</p>

      <ul>
        {schedule.dates.map((d, i) => {
          const option = schedule.options[d] || {};
          return (
            <li key={i}>
              <strong>{new Date(d).toLocaleDateString()}</strong>
              <span> - 区分: {option.type}</span>
              {option.type === "時刻指定" && (
                <span> ({option.start}〜{option.end})</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SharePage;
