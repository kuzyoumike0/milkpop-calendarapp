import React, { useEffect, useState } from "react";
import axios from "axios";

export default function PersonalPage() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");

  useEffect(() => {
    (async () => {
      try {
        const r = await axios.get("/api/personal");
        setItems(Array.isArray(r.data) ? r.data : []);
      } catch {
        setItems([]);
      }
    })();
  }, []);

  const add = async () => {
    if (!title || !date) return alert("タイトルと日付を入力");
    try {
      await axios.post("/api/personal", { title, date, time });
      const r = await axios.get("/api/personal");
      setItems(r.data || []);
      setTitle(""); setDate("");
    } catch {
      alert("API未実装のため保存できません（画面は表示可能）");
    }
  };

  return (
    <div style={{padding:"24px"}}>
      <h2>👤 個人スケジュール</h2>
      <div style={{display:"grid", gap:8, maxWidth:460}}>
        <input placeholder="タイトル" value={title} onChange={(e)=>setTitle(e.target.value)} />
        <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} />
        <input type="time" value={time} onChange={(e)=>setTime(e.target.value)} />
        <button onClick={add} style={btn}>追加</button>
      </div>

      <ul style={{marginTop:16}}>
        {items.map((it)=>(
          <li key={it.id}>{it.date} {it.time} {it.title}</li>
        ))}
      </ul>
    </div>
  );
}
const btn = { padding:"10px 14px", borderRadius:10, background:"#6C8CFF", color:"#fff", border:"none", fontWeight:700, cursor:"pointer" };
