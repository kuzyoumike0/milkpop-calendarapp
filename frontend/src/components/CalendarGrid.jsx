import React from "react";

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function firstWeekday(year, month) {
  return new Date(year, month, 1).getDay(); // 0 Sun - 6 Sat
}

export default function CalendarGrid({ year, month, selectedDates = [], onClickDate }) {
  const dim = daysInMonth(year, month);
  const first = firstWeekday(year, month);
  const cells = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push(d);

  const iso = (d) => {
    const m = String(month + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    return `${year}-${m}-${dd}`;
  };

  return (
    <div className="grid grid-cols-7 gap-2">
      {["日","月","火","水","木","金","土"].map(h => <div key={h} className="text-center text-sm opacity-70">{h}</div>)}
      {cells.map((d, i) => {
        if (d === null) return <div key={i} />;
        const dateStr = iso(d);
        const active = selectedDates.includes(dateStr);
        return (
          <button
            key={i}
            onClick={() => onClickDate(dateStr)}
            className={`aspect-square rounded-xl border text-sm
              ${active ? "bg-brandBlue text-white" : "bg-white/60"}`}
          >
            <div className="font-semibold">{d}</div>
          </button>
        );
      })}
    </div>
  );
}
