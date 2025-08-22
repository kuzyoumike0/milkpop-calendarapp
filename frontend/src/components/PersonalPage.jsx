// frontend/src/components/PersonalPage.jsx
import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import { useParams } from "react-router-dom";
import "../index.css";

const PersonalPage = () => {
  const { id } = useParams(); // 共有リンクのIDから取得
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
  if (!schedule) return <p>このスケジュールは存在しません。</p>;

  // 日付選択済みかどうかを判定
  const tileClassName = ({ date }) => {
    if (schedule.dates.some(d => new Date(d).toDateString() === date.toDateString())) {
      return "selected-date"; // index.css にある強調スタイルを再利用
    }
    return null;
  };

  return (
    <div className="page-container">
      <h2 className="page-title">個人スケジュール</h2>

      <div className="calendar-section">
        <Calendar tileClassName={tileClassName} />
      </div>

      <div className="schedule-section">
        <h3>詳細</h3>
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
    </div>
  );
};

export default PersonalPage;
