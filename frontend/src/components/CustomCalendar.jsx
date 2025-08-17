import React, { useState } from "react";

export default function CustomCalendar() {
  const [selected, setSelected] = useState(new Date());

  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "5px" }}>
      {days.map((d, i) => (
        <div key={i}
          style={{
            padding: "10px",
            textAlign: "center",
            backgroundColor: selected.toDateString() === d.toDateString() ? "#FDB9C8" : "#222",
            cursor: "pointer"
          }}
          onClick={() => setSelected(d)}
        >
          {d.getMonth() + 1}/{d.getDate()}
        </div>
      ))}
    </div>
  );
}
