import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function ShareLinkPage() {
  const { linkId } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // データ取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/shared/${linkId}`);
        setSchedules(res.data);
      } catch (err) {
        console.error(err);
        setError("予定を取得できませんでした");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [linkId]);

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>共有スケジュール</h2>
      <p>リンクID: {linkId}</p>

      {schedules.length === 0 ? (
        <p>登録された予定はありません。</p>
      ) : (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th>名前</th>
              <th>日付</th>
              <th>時間帯</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s, index) => (
              <tr key={index}>
                <td>{s.username}</td>
                <td>{s.schedule_date}</td>
                <td>{s.mode}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
