import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ShareLinkPage() {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    axios.get("/api/shared")
      .then((res) => {
        setSchedules(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>共有スケジュール一覧</h2>
      {schedules.length === 0 ? (
        <p>まだスケジュールがありません</p>
      ) : (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>名前</th>
              <th>日付</th>
              <th>入力モード</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s, i) => (
              <tr key={i}>
                <td>{s.username}</td>
                <td>{new Date(s.date).toLocaleDateString()}</td>
                <td>{s.mode === "range" ? "範囲" : "複数"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
