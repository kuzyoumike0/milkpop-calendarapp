import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function ShareLinkPage() {
  const { linkid } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [username, setUsername] = useState("");
  const [responses, setResponses] = useState({});

  useEffect(() => {
    axios.get(`/api/share/${linkid}`).then((res) => setSchedules(res.data));
  }, [linkid]);

  const handleSave = async () => {
    for (const schedule of schedules) {
      const response = responses[schedule.id];
      if (!response) continue;
      await axios.post("/api/response", {
        username,
        schedule_id: schedule.id,
        response,
      });
    }
    alert("保存しました！");
  };

  return (
    <div style={{ backgroundColor: "#000", color: "white", minHeight: "100vh", padding: "20px" }}>
      <header style={{ background: "#004CA0", padding: "15px", fontSize: "20px", fontWeight: "bold" }}>MilkPOP Calendar</header>
      <h2 style={{ color: "#FDB9C8" }}>共有スケジュール</h2>

      <input type="text" placeholder="名前" value={username} onChange={(e) => setUsername(e.target.value)} style={{ padding: "10px", margin: "10px 0", width: "100%" }} />

      {schedules.map((s) => (
        <div key={s.id} style={{ border: "1px solid #FDB9C8", padding: "10px", margin: "10px 0", borderRadius: "6px" }}>
          <p>{s.title} ({s.start_date} ~ {s.end_date}) [{s.timeslot}]</p>
          <select value={responses[s.id] || ""} onChange={(e) => setResponses({ ...responses, [s.id]: e.target.value })}>
            <option value="">選択してください</option>
            <option value="〇">〇</option>
            <option value="✖">✖</option>
          </select>
        </div>
      ))}

      <button onClick={handleSave} style={{ background: "#FDB9C8", color: "#000", padding: "10px 20px", border: "none", borderRadius: "8px" }}>
        保存
      </button>
    </div>
  );
}
