import React, { useState } from "react";
import axios from "axios";
import CustomCalendar from "./CustomCalendar";

export default function LinkPage() {
  const [title, setTitle] = useState("");
  const [rangeMode, setRangeMode] = useState("range");
  const [dates, setDates] = useState([]);
  const [timeslot, setTimeslot] = useState("全日");
  const [link, setLink] = useState("");

  const handleSubmit = async () => {
    if (dates.length === 0) return alert("日程を選択してください");
    const start_date = dates[0].format("YYYY-MM-DD");
    const end_date = dates[dates.length - 1].format("YYYY-MM-DD");

    try {
      const res = await axios.post("/api/schedule", {
        title, start_date, end_date, timeslot, range_mode: rangeMode
      });
      setLink(res.data.link);
    } catch (err) {
      alert("登録失敗");
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>MilkPOP Calendar</header>
      <h2 style={styles.title}>日程登録ページ</h2>
      <input
        placeholder="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={styles.input}
      />
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
      <button onClick={handleSubmit} style={styles.button}>リンク発行</button>
      {link && <p style={styles.link}>共有リンク: <a href={link}>{link}</a></p>}
    </div>
  );
}

const styles = {
  container: { padding: "20px", background: "#000", minHeight: "100vh", color: "#FDB9C8" },
  header: { fontSize: "24px", fontWeight: "bold", color: "#004CA0", marginBottom: "20px" },
  title: { fontSize: "20px", marginBottom: "10px" },
  input: { display:"block", margin:"10px 0", padding:"8px", borderRadius:"6px" },
  radioGroup: { display:"flex", gap:"20px", margin:"10px 0" },
  button: { padding:"10px 20px", background:"#FDB9C8", border:"none", borderRadius:"8px", fontWeight:"bold" },
  link: { marginTop:"15px", color:"#FDB9C8" }
};
