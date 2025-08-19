import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function ShareLinkPage() {
  const { linkId } = useParams();
  const [title, setTitle] = useState("読み込み中...");
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    if (!linkId) return;

    fetch(`/api/schedules/${linkId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          setTitle(data[0].title || "共有スケジュール");
          setSchedules(data);
        } else {
          setTitle("共有スケジュール");
        }
      })
      .catch(() => setTitle("エラーが発生しました"));
  }, [linkId]);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>{title}</h1>
      {schedules.length === 0 ? (
        <p>まだ登録がありません。</p>
      ) : (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>日付</th>
              <th>時間帯</th>
              <th>名前</th>
              <th>出欠</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s, i) => (
              <tr key={i}>
                <td>{s.date || "-"}</td>
                <td>{s.timeSlot || "-"}</td>
                <td>{s.username || "-"}</td>
                <td>{s.status || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
