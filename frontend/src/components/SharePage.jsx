import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

export default function SharePage() {
  const { linkid } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [name, setName] = useState("");

  const fetchData = () => {
    axios.get(`/api/share/${linkid}`).then((res) => setSchedules(res.data));
  };

  useEffect(() => {
    fetchData();
    const socket = io();
    socket.on("update", fetchData);
    return () => socket.disconnect();
  }, [linkid]);

  const respond = (scheduleId, status) => {
    axios.post(`/api/share/${linkid}/respond`, {
      scheduleId,
      name,
      status,
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>共有ページ</h2>
      <div>
        <label>名前: </label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <table border="1">
        <thead>
          <tr>
            <th>日付</th>
            <th>タイトル</th>
            <th>時間帯</th>
            <th>参加可否</th>
            <th>登録済み</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((s) => (
            <tr key={s.id}>
              <td>{s.date}</td>
              <td>{s.title}</td>
              <td>{s.timemode}</td>
              <td>
                <select onChange={(e) => respond(s.id, e.target.value)}>
                  <option value="">選択</option>
                  <option value="〇">〇</option>
                  <option value="✖">✖</option>
                </select>
              </td>
              <td>
                {s.responses.map((r, i) => (
                  <div key={i}>{r.name}: {r.status}</div>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
