import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const SharePage = () => {
  const { id } = useParams(); // URL の :id 部分
  const [title, setTitle] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/share/${id}`);
        if (!res.ok) throw new Error("データ取得に失敗しました");
        const data = await res.json();

        if (data.length > 0) {
          setTitle(data[0].title || "（無題）"); // ✅ タイトル
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
      <h1 className="page-title">📖 共有された日程</h1>

      {/* タイトル */}
      <h2 style={{ marginBottom: "20px", color: "#333" }}>📝 {title}</h2>

      {schedules.length === 0 ? (
        <p>データが見つかりません</p>
      ) : (
        <table className="schedule-table">
          <thead>
            <tr>
              <th>日付</th>
              <th>区分</th>
              <th>開始時刻</th>
              <th>終了時刻</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s, idx) => (
              <tr key={idx}>
                <td>{s.date}</td>
                <td>{s.type}</td>
                <td>{s.start || "-"}</td>
                <td>{s.end || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SharePage;
