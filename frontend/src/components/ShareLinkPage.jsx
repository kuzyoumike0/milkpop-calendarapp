import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function ShareLinkPage() {
  const [rangeMode, setRangeMode] = useState("範囲選択");
  const [selectedDates, setSelectedDates] = useState([]);

  const handleDateChange = (value) => {
    if (rangeMode === "範囲選択") {
      if (Array.isArray(value)) {
        const [start, end] = value;
        let temp = [];
        let cur = new Date(start);
        while (cur <= end) {
          temp.push(new Date(cur));
          cur.setDate(cur.getDate() + 1);
        }
        setSelectedDates(temp);
      }
    } else if (rangeMode === "複数選択") {
      setSelectedDates((prev) =>
        prev.find((d) => d.toDateString() === value.toDateString())
          ? prev.filter((d) => d.toDateString() !== value.toDateString())
          : [...prev, value]
      );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <header className="text-center text-3xl font-bold text-[#FDB9C8] mb-6">
        MilkPOP Calendar - 共有リンク
      </header>

      <div className="max-w-3xl mx-auto bg-[#004CA0] p-6 rounded-2xl shadow-lg space-y-6">
        <div className="flex space-x-4">
          <label>
            <input
              type="radio"
              value="範囲選択"
              checked={rangeMode === "範囲選択"}
              onChange={(e) => setRangeMode(e.target.value)}
            />
            範囲選択
          </label>
          <label>
            <input
              type="radio"
              value="複数選択"
              checked={rangeMode === "複数選択"}
              onChange={(e) => setRangeMode(e.target.value)}
            />
            複数選択
          </label>
        </div>

        <div className="bg-white rounded-xl p-4">
          <Calendar
            selectRange={rangeMode === "範囲選択"}
            onChange={handleDateChange}
          />
        </div>

        <div className="bg-gray-900 rounded-xl p-4 text-white">
          <h2 className="text-lg font-bold mb-2">選択された日付</h2>
          <ul>
            {selectedDates.map((d, i) => (
              <li key={i}>{d.toISOString().split("T")[0]}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
