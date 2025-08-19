import React, { useState } from "react";

export default function TimeSelector({ onChange }) {
  const [value, setValue] = useState("allday");

  // 時間帯 + 時刻の候補をまとめて作る
  const options = [
    { label: "全日", value: "allday" },
    { label: "朝", value: "morning" },
    { label: "昼", value: "afternoon" },
    { label: "夜", value: "evening" },
    ...Array.from({ length: 24 }, (_, i) => {
      const h = String(i).padStart(2, "0") + ":00";
      return { label: h, value: h };
    }),
  ];

  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange(newValue);
  };

  return (
    <div>
      <label>時間帯を選択：</label>
      <select value={value} onChange={handleChange}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
