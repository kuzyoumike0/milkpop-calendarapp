import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function formatDate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function PersonalPage() {
  const [events, setEvents] = useState({});
  const [title, setTitle] = useState("");
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
      week.push({
        date: new Date(current),
        str: dStr,
        isToday,
        inMonth: current.getMonth() + 1 === month,
      });
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }

  const addEvent = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setEvents(prev => ({
      ...prev,
      [selectedDate]: [...(prev[selectedDate] || []), title]
    }));
    setTitle("");
  };

  const generateShareLink = () => {
    const id = Math.random().toString(36).substring(2, 8);
    navigate(`/shared/${id}`);
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#fafafa", minHeight: "100vh" }}>
      <header style={{ background: "#ff6f61", color: "#fff", padding: "1rem", textAlign: "center", fontSize: "1.5rem", fontWeight: "bold" }}>
        MilkpopCalendar
      </header>

      <main style={{ maxWidth: 900, margin: "2rem auto", padding: "1rem", background: "#fff", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <h2 style={{ textAlign: "center", color: "#ff6f61" }}>個人スケジュール</h2>

        <form onSubmit={addEvent} style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
          <input type="text" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="予定タイトル" style={{ padding: ".5rem", width:"60%" }} />
          <button type="submit" style={{ marginLeft: ".5rem", padding: ".5rem 1rem", background: "#ff6f61", color: "#fff", border: "none", borderRadius: "6px" }}>追加</button>
        </form>

        <div style={{ overflowX: "auto", marginBottom: "1rem" }}>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead><tr>{["日","月","火","水","木","金","土"].map(d=>(<th key={d} style={{ padding: ".5rem", borderBottom: "2px solid #ff6f61" }}>{d}</th>))}</tr></thead>
            <tbody>
              {weeks.map((week, wi)=>(
                <tr key={wi}>
                  {week.map((day, di)=>(
                    <td key={di} onClick={()=>setSelectedDate(day.str)} style={{ cursor:"pointer", padding:".75rem", textAlign:"center", borderRadius:"8px",
                      background: day.str===selectedDate ? "#4caf50" : day.isToday ? "#ffeb3b" : day.inMonth ? "#fff" : "#f5f5f5",
                      border: "1px solid #ddd"
                    }}>
                      {day.date.getDate()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <h3 style={{ color: "#333" }}>{selectedDate} の予定</h3>
          <ul>
            {(events[selectedDate] || []).map((t,i)=>(<li key={i}>{t}</li>))}
          </ul>
        </div>

        <div style={{ textAlign: "center" }}>
          <button onClick={generateShareLink} style={{ padding: "0.75rem 1.5rem", background: "#4caf50", color: "#fff", border: "none", borderRadius: "8px" }}>
            共有リンクを発行
          </button>
        </div>
      </main>
    </div>
  );
}
