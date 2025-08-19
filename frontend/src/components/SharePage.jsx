import React, { useState, useEffect } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

// 開発と本番でURLを切り替え
const SOCKET_URL =
  process.env.NODE_ENV === "production"
    ? "https://あなたのRailwayドメイン.up.railway.app"
    : "http://localhost:8080";

const socket = io(SOCKET_URL);

export default function SharePage() {
  const { linkId } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [date, setDate] = useState(new Date());
  const [username, setUsername] = useState("");
  const [timeSlot, setTimeSlot] = useState("全日");
  const [status, setStatus] = useState("◯");

  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // 初期データ取得 & ソケット参加
  useEffect(() => {
    axios
      .get(`/api/schedules/${linkId}`)
      .then((res) => setSchedules(res.data))
      .catch((err) => console.error("取得失敗:", err));

    socket.emit("join", linkId);

    socket.on("updateSchedules", (data) => {
      setSchedules(data);
    });

    return () => {
      socket.off("updateSchedules");
    };
  }, [linkId]);

  const handleSave = async () => {
    const newSchedule = {
      linkId,
      date: formatDate(date),
      timeSlot,
      username,
      status,
    };

    try {
      await axios.post("/api/schedule", newSchedule);
      // 自分の画面はサーバーからの "updateSchedules" で更新される
    } catch (err) {
      console.error("保存失敗:", err);
      alert("保存に失敗しました");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>共有スケジュール</h2>

      <div>
        <label>名前: </label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="名前を入力"
        />
      </div>

      <div>
        <label>日付: </label>
        <Calendar onChange={setDate} value={date} />
      </div>

      <div>
        <label>時間帯: </label>
        <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
          <option value="全日">全日</option>
          <option value="昼">昼</option>
          <option value="夜">夜</option>
        </select>
      </div>

      <div>
        <label>出欠: </label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="◯">◯</option>
          <option value="✕">✕</option>
        </select>
      </div>

      <button onClick={handleSave}>保存</button>

      <h3>登録済みスケジュール</h3>
      <table border="1" cellPadding="5" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>日付</th>
            <th>時間帯</th>
            <th>名前</th>
            <th>出欠</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((s, idx) => (
            <tr key={idx}>
              <td>{s.date}</td>
              <td>{s.timeSlot}</td>
              <td>{s.username}</td>
              <td>{s.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
