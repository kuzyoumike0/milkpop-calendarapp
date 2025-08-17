import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";

function formatDate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function SharedLinkPage() {
  const { shareId } = useParams();
  const [events, setEvents] = useState({});
  const [title, setTitle] = useState("");
  const [timeType, setTimeType] = useState("all");
  const [slot, setSlot] = useState("全日");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("18:00");
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const navigate = useNavigate();

  const today = new Date();
  const todayStr = formatDate(today);
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const weeks = [];
  let current = new Date(firstDay);
  current.setDate(current.getDate() - current.getDay());

  while (current <= lastDay || current.getDay() !== 0) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      const dStr = formatDate(current);
      const isToday = dStr === todayStr;
      week.push({ date: new Date(current), str: dStr, isToday, inMonth: current.getMonth() + 1 === month });
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }

  const addEvent = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    let timeLabel = timeType==="all" ? slot : `${start} - ${end}`;
    const eventStr = `${title} (${timeLabel})`;
    setEvents(prev => ({ ...prev, [selectedDate]: [...(prev[selectedDate]||[]), eventStr] }));
    setTitle("");
  };

  const generateShareLink = async () => {
    const res = await fetch("/api/generateShare", { method: "POST" });
    const data = await res.json();
    navigate(`/shared/${data.shareId}`);
  };

  return (
    <Layout>
      <h2 style={{ textAlign:"center", color:"#FDB9C8" }}>共有スケジュール</h2>
      <form onSubmit={addEvent} style={{ display:"flex", flexDirection:"column", gap:".5rem", marginBottom:"1rem" }}>
        <input type="text" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="予定タイトル" style={{ padding:".5rem", borderRadius:"6px", border:"1px solid #FDB9C8" }} />
        <div style={{ display:"flex", gap:"1rem", alignItems:"center" }}>
          <label><input type="radio" checked={timeType==="all"} onChange={()=>setTimeType("all")} /> 全日/昼/夜</label>
          <label><input type="radio" checked={timeType==="custom"} onChange={()=>setTimeType("custom")} /> 時間指定</label>
        </div>
        {timeType==="all" ? (
          <select value={slot} onChange={(e)=>setSlot(e.target.value)} style={{ padding:".5rem", borderRadius:"6px", border:"1px solid #FDB9C8" }}>
            <option>全日</option><option>昼</option><option>夜</option>
          </select>
        ) : (
          <div style={{ display:"flex", gap:".5rem" }}>
            <input type="time" value={start} onChange={(e)=>setStart(e.target.value)} style={{ padding:".5rem" }} />
            <span>~</span>
            <input type="time" value={end} onChange={(e)=>setEnd(e.target.value)} style={{ padding:".5rem" }} />
          </div>
        )}
        <button type="submit" style={{ padding:".5rem 1rem", background:"#FDB9C8", color:"#000", border:"none", borderRadius:"6px", fontWeight:"bold" }}>追加</button>
      </form>
      <div style={{ overflowX:"auto", marginBottom:"1rem" }}>
        <table style={{ borderCollapse:"collapse", width:"100%", background:"#222" }}>
          <thead><tr>{["日","月","火","水","木","金","土"].map(d=>(<th key={d} style={{ padding:".5rem", borderBottom:"2px solid #004CA0", color:"#FDB9C8" }}>{d}</th>))}</tr></thead>
          <tbody>{weeks.map((week,wi)=>(<tr key={wi}>{week.map((day,di)=>(<td key={di} onClick={()=>setSelectedDate(day.str)} style={{ cursor:"pointer", padding:".75rem", textAlign:"center", borderRadius:"8px", background: day.str===selectedDate? "#004CA0" : day.isToday? "#FDB9C8" : day.inMonth? "#111":"#333", color: day.str===selectedDate? "#fff" : day.isToday? "#000":"#fff", border:"1px solid #444" }}>{day.date.getDate()}</td>))}</tr>))}</tbody>
        </table>
      </div>
      <div style={{ marginBottom:"1rem" }}>
        <h3 style={{ color:"#FDB9C8" }}>{selectedDate} の予定</h3>
        <ul>{(events[selectedDate]||[]).map((t,i)=>(<li key={i}>{t}</li>))}</ul>
      </div>
      <div style={{ textAlign:"center" }}>
        <button onClick={generateShareLink} style={{ padding:"0.75rem 1.5rem", background:"#004CA0", color:"#FDB9C8", border:"none", borderRadius:"8px", fontWeight:"bold" }}>新しい共有リンクを発行</button>
      </div>
    </Layout>
  );
}
