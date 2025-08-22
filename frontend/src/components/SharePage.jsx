import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../index.css";

const SharePage = () => {
  const { id } = useParams(); // /share/:id
  const [title, setTitle] = useState(""); // ✅ 追加: タイトル
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/share/${id}`);
        if (!res.ok) throw new Error("データ取得失敗");
        const data = await res.json();

        // ✅ 取得データに title を含める
        if (data.length > 0) {
          setTitle(data[0].title || "（タイトルなし）");
        }
        setSchedules(data);
      } catch (err) {
        console.error("取得エラー:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, [id]);

  if (loading) return <p>読み込み中...</p>;

  return (
    <div className="page-container">
      <h1 className="page-title">📤 共有された日程</h1>

      {/* ✅ タイトル表示 */}
      <h2 style={{ marginBottom: "20px", color: "#333" }}>📌 {title}</h2>

      {schedules.length === 0 ? (
        <p>データが見つかりません</p>
      ) : (
        <ul className="share-list">
          {schedules.map((s, idx) => (
            <li key={idx} className="share-item">
              <strong>{s.date}</strong> ：
              {s.type === "時間指定"
                ? `${s.start} ~ ${s.end}`
                : s.type}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SharePage;
