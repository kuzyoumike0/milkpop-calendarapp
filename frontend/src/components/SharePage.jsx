import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../index.css";

const SharePage = () => {
  const { id } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await fetch(`/api/share/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "取得失敗");
        setSchedules(data.schedules);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchSchedules();
  }, [id]);

  if (error) return <p style={{ color: "red" }}>❌ {error}</p>;
  if (schedules.length === 0) return <p>読み込み中...</p>;

  return (
    <div className="page-container">
      <h1 className="page-title">📤 共有されたスケジュール</h1>
      <table className="fancy-table">
        <thead>
          <tr>
            <th>日付</th>
            <th>区分</th>
            <th>開始</th>
            <th>終了</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((s, idx) => (
            <tr key={idx}>
              <td>{s.date}</td>
              <td>{s.type}</td>
              <td>{s.start_time || "-"}</td>
              <td>{s.end_time || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SharePage;
