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
  const [selectedDates, setSelectedDates] = useState([new Date(), new Date()]);
  const [username, setUsername] = useState("");
  const [timeSlot, setTimeSlot] = useState("全日");
  const [mode, setMode] = useState("range");

  const formatDate = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;

  useEffect(() => {
    axios.get(`/api/mode/${linkId}`).then((res) => setMode(res.data.mode));
    socket.emit("join", linkId);
    socket.on("updateMode", (newMode) => setMode(newMode));
    return () => {
      socket.off("updateMode");
    };
  }, [linkId]);

  const handleModeChange = async (newMode) => {
    setMode(newMode); // ← 即座にUIに反映
    await axios.post("/api/mode", { linkId, mode: newMode });
  };

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
    for (const d of datesToSave) {
      await axios.post("/api/schedule", {
        linkId,
        date: formatDate(d),
        timeSlot,
        username
      });
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>共有スケジュール</h2>
      <div>
        <label>名前: </label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} />
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
      <Calendar
        selectRange={mode === "range"}
        onChange={(value) => setSelectedDates(value)}
        value={selectedDates}
      />
      <div>
        <label>時間帯: </label>
        <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
          <option value="全日">全日</option>
          <option value="昼">昼</option>
          <option value="夜">夜</option>
        </select>
      </div>
      <button onClick={handleSave}>保存</button>
    </div>
  );
}
