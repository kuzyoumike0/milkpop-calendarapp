import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function ShareLinkPage() {
  const { id } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [username, setUsername] = useState("");

  useEffect(() => {
    axios.get(`/api/link/${id}`).then((res) => {
      setSchedules(res.data);
    });
  }, [id]);

  const respond = async (scheduleId, answer) => {
    if (!username) {
      alert("名前を入力してください");
      return;
    }
    await axios.post("/api/respond", { scheduleId, username, answer });
    const res = await axios.get(`/api/link/${id}`);
    setSchedules(res.data);
  };

  // 日付ごとにまとめる
  const grouped = schedules.reduce((acc, cur) => {
    const key = cur.date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(cur);
    return acc;
  }, {});

  return (
    <div style={{ padding: "20px" }}>
      <h2>📅 共有スケジュール</h2>
      <input
        placeholder="あなたの名前"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <table border="1" style={{ marginTop: "20px", width: "100%" }}>
        <thead>
          <tr>
            <th>日付</th>
            <th>ユーザー</th>
            <th>可否</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(grouped).map(([date, rows]) =>
            rows.map((r, i) => (
              <tr key={r.id + i}>
                <td>{date}</td>
                <td>{r.username || "-"}</td>
                <td>{r.answer === null ? "-" : r.answer ? "◯" : "×"}</td>
                <td>
                  <button onClick={() => respond(r.id, true)}>◯</button>
                  <button onClick={() => respond(r.id, false)}>×</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
