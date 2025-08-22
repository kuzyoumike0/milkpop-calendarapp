import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const SharePage = () => {
  const { id } = useParams(); // /share/:id
  const [schedules, setSchedules] = useState([]);
  const [title, setTitle] = useState(""); // ✅ タイトルを保存
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/share/${id}`);
        if (!res.ok) throw new Error("取得に失敗しました");
        const data = await res.json();

        if (data.length > 0) {
          setTitle(data[0].title || "（無題）"); // ✅ 先頭にタイトルを格納してる想定
          setSchedules(data);
        }
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
      <h1 className="page-title">📤 共有スケジュール</h1>

      {/* ✅ タイトルを表示 */}
      <h2 style={{ marginBottom: "15px" }}>📝 {title}</h2>

      {schedules.length === 0 ? (
        <p>スケジュールが見つかりません</p>
      ) : (
        <ul className="schedule-list">
          {schedules.map((s, idx) => (
            <li key={idx} className="schedule-item">
              <strong>{s.date}</strong> ： {s.type}
              {s.type === "時間指定" && (
                <>
                  {" "}
                  ({s.start} ~ {s.end})
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SharePage;
