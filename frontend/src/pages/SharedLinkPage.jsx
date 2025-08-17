import React, { useState } from "react";

function formatDate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function SharedLinkPage() {
  const [selectMode, setSelectMode] = useState("single");
  const [selectedDates, setSelectedDates] = useState([]);

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

  const toggleSelect = (dStr) => {
    if (selectMode === "single") {
      setSelectedDates([dStr]);
    } else if (selectMode === "multi") {
      setSelectedDates(prev => prev.includes(dStr) ? prev.filter(x => x !== dStr) : [...prev, dStr]);
    } else if (selectMode === "range") {
      if (selectedDates.length < 2) {
        setSelectedDates([...selectedDates, dStr]);
      } else {
        setSelectedDates([dStr]);
      }
    }
  };

  const isSelected = (dStr) => {
    if (selectMode === "range" && selectedDates.length === 2) {
      const [start, end] = selectedDates.sort();
      return dStr >= start && dStr <= end;
    }
    return selectedDates.includes(dStr);
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#fafafa", minHeight: "100vh" }}>
      <header style={{ background: "#ff6f61", color: "#fff", padding: "1rem", textAlign: "center", fontSize: "1.5rem", fontWeight: "bold" }}>
        MilkpopCalendar
      </header>

      <main style={{ maxWidth: 900, margin: "2rem auto", padding: "1rem", background: "#fff", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <h2 style={{ textAlign: "center", color: "#ff6f61" }}>共有カレンダー</h2>

        <div style={{ display: "flex", justifyContent: "center", margin: "1rem" }}>
          <label><input type="radio" name="mode" value="single" checked={selectMode==="single"} onChange={()=>setSelectMode("single")} /> 単一選択</label>
          <label style={{ marginLeft: "1rem" }}><input type="radio" name="mode" value="multi" checked={selectMode==="multi"} onChange={()=>setSelectMode("multi")} /> 複数選択</label>
          <label style={{ marginLeft: "1rem" }}><input type="radio" name="mode" value="range" checked={selectMode==="range"} onChange={()=>setSelectMode("range")} /> 範囲選択</label>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead><tr>{["日","月","火","水","木","金","土"].map(d=>(<th key={d} style={{ padding: ".5rem", borderBottom: "2px solid #ff6f61" }}>{d}</th>))}</tr></thead>
            <tbody>
              {weeks.map((week, wi)=>(
                <tr key={wi}>
                  {week.map((day, di)=>(
                    <td key={di} onClick={()=>toggleSelect(day.str)} style={{ cursor:"pointer", padding:".75rem", textAlign:"center", borderRadius:"8px",
                      background: isSelected(day.str) ? "#4caf50" : day.isToday ? "#ffeb3b" : day.inMonth ? "#fff" : "#f5f5f5",
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
      </main>
    </div>
  );
}
