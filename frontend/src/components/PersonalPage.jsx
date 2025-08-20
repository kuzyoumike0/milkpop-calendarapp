import React, { useState } from "react";
import axios from "axios";
import CustomCalendar from "./CustomCalendar";

export default function PersonalPage() {
  const [username, setUsername] = useState("");
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [rangeMode, setRangeMode] = useState("range");
  const [dates, setDates] = useState([]);
  const [timeslot, setTimeslot] = useState("全日");
  const [saved, setSaved] = useState([]);

  const handleSubmit = async () => {
    if (dates.length === 0) return alert("日程を選択してください");
    const start_date = dates[0].format("YYYY-MM-DD");
    const end_date = dates[dates.length - 1].format("YYYY-MM-DD");

    try {
      await axios.post("/api/personal", {
        username, title, memo, start_date, end_date, timeslot, range_mode: rangeMode
      });
      setSaved([...saved, { username, title, memo, start_date, end_date, timeslot }]);
    } catch (err) {
      alert("保存失敗");
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>MilkPOP Calendar</header>
      <h2 style={styles.title}>個人スケジュール登録</h2>
      <input placeholder="名前" value={username} onChange={(e)=>setUsername(e.target.value)} style={styles.input}/>
      <input placeholder="タイトル" value={title} onChange={(e)=>setTitle(e.target.value)} style={styles.input}/>
      <textarea placeholder="メモ" value={memo} onChange={(e)=>setMemo(e.target.value)} style={styles.input}/>
      <div style={styles.radioGroup}>
        <label><input type="radio" value="range" checked={rangeMode==="range"} onChange={()=>setRangeMode("range")} /> 範囲選択</label>
        <label><input type="radio" value="multiple" checked={rangeMode==="multiple"} onChange={()=>setRangeMode("multiple")} /> 複数選択</label>
      </div>
      <CustomCalendar rangeMode={rangeMode} onChange={setDates} />
      <select value={timeslot} onChange={(e)=>setTimeslot(e.target.value)} style={styles.input}>
        <option>全日</option>
        <option>昼</option>
        <option>夜</option>
      </select>
      <button onClick={handleSubmit} style={styles.button}>保存</button>
      <ul>
        {saved.map((s,i)=>(
          <li key={i}>{s.username} | {s.title} | {s.memo} | {s.start_date}~{s.end_date} ({s.timeslot})</li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  container: { padding: "20px", background: "#000", minHeight: "100vh", color: "#FDB9C8" },
  header: { fontSize: "24px", fontWeight: "bold", color: "#004CA0", marginBottom: "20px" },
  title: { fontSize: "20px", marginBottom: "10px" },
  input: { display:"block", width:"100%", margin:"10px 0", padding:"8px", borderRadius:"6px" },
  radioGroup: { display:"flex", gap:"20px", margin:"10px 0" },
  button: { padding:"10px 20px", background:"#FDB9C8", border:"none", borderRadius:"8px", fontWeight:"bold" }
};
