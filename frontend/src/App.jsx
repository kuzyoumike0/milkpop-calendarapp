import React from "react";
import { useState } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';

export default function App() {
  const [value, setValue] = useState(new Date());
  return (
    <div style={{ padding: 20 }}>
      <h1>Milkpop Calendar (Optional Login)</h1>
      <Calendar
        onChange={setValue}
        value={value}
        selectRange={true}
      />
      <p>Selected: {Array.isArray(value) ? value.map(v => v.toDateString()).join(" - ") : value.toDateString()}</p>
    </div>
  );
}
