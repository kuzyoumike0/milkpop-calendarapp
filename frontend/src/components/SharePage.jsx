import React, { useState, useEffect } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:8080";
const socket = io(SOCKET_URL);

export default function SharePage() {
  const { linkId } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [selectedDates, setSelectedDates] = useState([new Date(), new Date()]);
  const [username, setUsername] = useState("");
  const [timeSlot, setTimeSlot] = useState("全日");
  const [status, setStatus] = useState("◯");
  const [mode, setMode] = useState("range"); // 初期値は範囲選択

  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // 初期ロード
  useEffect(() => {
    axios.get(`/api/schedules/${linkId}`).then((res) => setSchedules(res.data));

    // 現在のモード取得
    axios.get(`/api/mode/${linkId}`).then((res) => setMode(res.data.mode));

    socket.emit("join", linkId);

    socket.on("updateSchedules", (data) => {
      setSchedules(data);
    });

    socket.on("updateMode", (newMode) => {
      setMode(newMode);
    });

    return () => {
      socket.off("updateSchedules");
      socket.off("updateMode");
    };
  }, [linkId]);

  // モード切替
  const handleModeChange = async (newMode) => {
    try {
      await axios.post("/api/mode", { linkId, mode: newMode });
    } catch (err) {
      console.error("モード変更失敗:", err);
    }
  };

  // 保存処理
  const handleSave = async () => {
    let datesToSave = [];

    if (mode === "range") {
      const [start, end] = selectedDates;
      let cur = new Date(start);
      while (cur <= end) {
        datesToSave.push(new Date(cur));
        cur.setDate(cur.getDate() + 1);
      }
    } else if (mode === "multiple") {
      datesToSave = selectedDates;
    }

    try {
      for (const d of datesToSave) {
        await axios.post("/api/schedule", {
          linkId,
          date: formatDate(d),
          timeSlot,
          username,
          status,
        });
      }
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
        <label>モード: </label>
        <label>
          <input
            type="radio"
            value="range"
            checked={mode === "range"}
            onChange={() => handleModeChange("range")}
          />
          範囲選択
        </label>
        <label>
          <input
            type="radio"
            value="multiple"
            checked={mode === "multiple"}
            onChange={() => handleModeChange("multiple")}
          />
          複数選択
        </label>
      </div>

      <div>
        <label>日付: </label>
        <Calendar
          selectRange={mode === "range"}
          onChange={(value) => setSelectedDates(value)}
          value={selectedDates}
          allowMultiple={mode === "multiple" ? true : undefined}
        />
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
