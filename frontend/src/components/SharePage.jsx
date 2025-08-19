import React, { useState } from "react";

export default function SharePage() {
  const [mode, setMode] = useState("range"); // range | multi
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);

  // 範囲選択で日付リストを作る
  const generateRange = () => {
    if (!startDate || !endDate) return [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split("T")[0]);
    }
    return dates;
  };

  const handleDateClick = (date) => {
    if (selectedDates.includes(date)) {
      setSelectedDates(selectedDates.filter(d => d !== date));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  const handleShare = async () => {
    const dates =
      mode === "range" ? generateRange() : selectedDates;

    if (dates.length === 0) {
      alert("日程を選択してください");
      return;
    }

    const res = await fetch("/api/sharelink", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dates, category: "終日" }) // categoryは別のUIから渡す
    });
    const data = await res.json();
    if (data.linkId) {
      alert(`共有リンク: ${window.location.origin}/share/${data.linkId}`);
    }
  };

  return (
    <div>
      <h2>日程の選択</h2>
      <label>
        <input
          type="radio"
          value="range"
          checked={mode === "range"}
          onChange={() => setMode("range")}
        />
        範囲選択
      </label>
      <label>
        <input
          type="radio"
          value="multi"
          checked={mode === "multi"}
          onChange={() => setMode("multi")}
        />
        複数選択
      </label>

      {mode === "range" && (
        <div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          ～
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      )}

      {mode === "multi" && (
        <div>
          {/* 本当はカレンダーUIが良いですが、ここでは日付入力を簡易に */}
          <input
            type="date"
            onChange={(e) => handleDateClick(e.target.value)}
          />
          <div>
            選択済み: {selectedDates.join(", ")}
          </div>
        </div>
      )}

      <button onClick={handleShare}>共有リンクを発行</button>
    </div>
  );
}
