import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const SharePage = () => {
  const { id } = useParams(); // URL の /share/:id
  const [schedules, setSchedules] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/share/${id}`);
        const data = await res.json();
        if (data.length > 0) {
          setTitle(data[0].title || "共有スケジュール");
        }
        setSchedules(data);
      } catch (err) {
        console.error("共有データ取得エラー:", err);
      }
    };
    fetchData();
  }, [id]);

  return (
    <div className="page-container">
      <h1 className="page-title">📢 共有ページ</h1>

      {/* ✅ タイトルを表示 */}
      <h2 style={{ marginBottom: "20px", color: "#333" }}>
        {title}
      </h2>

      {schedules.length === 0 && <p>読み込み中、またはデータが存在しません。</p>}

      <ul className="schedule-list">
        {schedules.map((s, idx) => (
          <li key={idx} className="schedule-item">
            <strong>{s.date}</strong> ： {s.type}
            {s.type === "時間指定" && (
              <>
                {" "}
                ({s.start} - {s.end})
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SharePage;
