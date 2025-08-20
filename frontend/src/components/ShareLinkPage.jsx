import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function ShareLinkPage() {
  const { linkid } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [username, setUsername] = useState("");
  const [responses, setResponses] = useState({});

  useEffect(() => {
    axios.get(`/api/share/${linkid}`).then(res => setSchedules(res.data));
  }, [linkid]);

  const handleSave = async () => {
    for (let s of schedules) {
      if (responses[s.id]) {
        await axios.post("/api/response", {
          username,
          schedule_id: s.id,
          response: responses[s.id]
        });
      }
    }
    alert("保存しました");
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>MilkPOP Calendar</header>
      <h2>共有スケジュール</h2>
      <input placeholder="名前" value={username} onChange={(e)=>setUsername(e.target.value)} style={styles.input}/>
      <table style={styles.table}>
        <thead>
          <tr><th>タイトル</th><th>期間</th><th>時間帯</th><th>回答</th></tr>
        </thead>
        <tbody>
          {schedules.map(s=>(
            <tr key={s.id}>
              <td>{s.title}</td>
              <td>{s.start_date} ~ {s.end_date}</td>
              <td>{s.timeslot}</td>
              <td>
                <select onChange={(e)=>setResponses({...responses,[s.id]:e.target.value})}>
                  <option value="">選択</option>
                  <option value="〇">〇</option>
                  <option value="✖">✖</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleSave} style={styles.button}>保存</button>
    </div>
  );
}

const styles = {
  container: { padding:"20px", background:"#000", minHeight:"100vh", color:"#FDB9C8" },
  header: { fontSize:"24px", fontWeight:"bold", color:"#004CA0", marginBottom:"20px" },
  input: { display:"block", margin:"10px 0", padding:"8px", borderRadius:"6px" },
  table: { width:"100%", borderCollapse:"collapse", marginTop:"20px", background:"#111" },
  button: { marginTop:"15px", padding:"10px 20px", background:"#FDB9C8", border:"none", borderRadius:"8px" }
};
