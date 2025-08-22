import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const SharePage = () => {
  const { id } = useParams(); // URLの :id を取得
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/share/${id}`);
        if (!res.ok) throw new Error("データ取得に失敗しました");
        const data = await res.json();
        setSchedules(data);
      } catch (err) {
        console.error("取得エラー:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, [id]);

  if (loading) return <p>⏳ 読み込み中...</p>;

  return (
    <div className="page-container">
      <h1 className="page-title">🔗 共有スケジュール</h1>

      {schedules.length === 0 ? (
        <p>この共有リンクには日程が登録されていません。</p>
      ) : (
        <ul className="schedule-list">
          {schedules.map((s, idx) => (
            <li key={idx} className="schedule-item">
              <strong>{s.date}</strong>  
              {s.type === "時間指定"
                ? ` ${s.start} ~ ${s.end}`
                : ` (${s.type})`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SharePage;
