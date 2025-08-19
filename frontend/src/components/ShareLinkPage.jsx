import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function ShareLinkPage() {
  const [mode, setMode] = useState("multi"); // "multi" or "range"
  const [selectedDates, setSelectedDates] = useState([]);
  const [range, setRange] = useState(null);

  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleClickDay = (value) => {
    if (mode === "multi") {
      const fd = formatDate(value);
      setSelectedDates((prev) =>
        prev.includes(fd) ? prev.filter((d) => d !== fd) : [...prev, fd]
      );
    }
  };

  const handleRangeChange = (val) => {
    if (mode === "range") {
      setRange(val);
      if (val?.[0] && val?.[1]) {
        let d = new Date(val[0]);
        const arr = [];
        while (d <= val[1]) {
          arr.push(formatDate(new Date(d)));
          d.setDate(d.getDate() + 1);
        }
        setSelectedDates(arr);
      }
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>カレンダー複数日選択</h2>
      <label>
        <input
          type="radio"
          value="multi"
          checked={mode === "multi"}
          onChange={() => setMode("multi")}
        />
        複数日選択
      </label>
      <label>
        <input
          type="radio"
          value="range"
          checked={mode === "range"}
          onChange={() => setMode("range")}
        />
        範囲選択
      </label>

      <Calendar
        onClickDay={handleClickDay}
        onChange={handleRangeChange}
        selectRange={mode === "range"}
        value={mode === "range" ? range : null}
        tileClassName={({ date }) =>
          selectedDates.includes(formatDate(date)) ? "selected-day" : null
        }
      />

      <div style={{ marginTop: 20 }}>
        <h3>選択した日付:</h3>
        <ul>
          {selectedDates.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
