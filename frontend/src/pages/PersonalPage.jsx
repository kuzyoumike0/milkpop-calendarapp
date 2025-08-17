import React, { useState } from "react";
import Layout from "../components/Layout";

function formatDate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function PersonalPage() {
  const [title, setTitle] = useState("");
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

  return (
    <Layout>
      <h2 style={{ color: "#FDB9C8", textAlign:"center" }}>個人スケジュール</h2>
      <input type="text" placeholder="タイトル入力" value={title} onChange={(e)=>setTitle(e.target.value)} style={{ padding:".5rem", width:"100%", borderRadius:"6px", border:"1px solid #FDB9C8", margin:"1rem 0" }} />
      <div style={{ overflowX:"auto" }}>
        <table style={{ borderCollapse:"collapse", width:"100%", background:"#222" }}>
          <thead><tr>{["日","月","火","水","木","金","土"].map(d=>(<th key={d} style={{ padding:".5rem", borderBottom:"2px solid #004CA0", color:"#FDB9C8" }}>{d}</th>))}</tr></thead>
          <tbody>
            {weeks.map((week, wi)=>(<tr key={wi}>
              {week.map((day, di)=>(
                <td key={di} style={{ padding:".75rem", textAlign:"center", borderRadius:"8px", background: day.isToday ? "#FDB9C8" : day.inMonth ? "#111" : "#333", color: day.isToday ? "#000" : "#fff", border:"1px solid #444" }}>{day.date.getDate()}</td>
              ))}
            </tr>))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
