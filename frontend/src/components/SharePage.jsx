import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function SharePage() {
  const [mode, setMode] = useState("range"); // range | multi
  const [rangeDates, setRangeDates] = useState([null, null]);
  const [multiDates, setMultiDates] = useState([]);

  // 範囲選択時に日付リストを生成
  const generateRange = () => {
    if (!rangeDates[0] || !rangeDates[1]) return [];
    const start = new Date(rangeDates[0]);
    const end = new Date(rangeDates[1]);
    const dates = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split("T")[0]);
    }
    return dates;
  };

  // 複数選択のクリック処理
  const handleMultiClick = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    if (multiDates.includes(dateStr)) {
      setMultiDates(multiDates.filter((d) => d !== dateStr));
    } else {
      setMultiDates([...multiDates, dateStr]);
    }
  };

  // カレンダーの tileClassName で選択日を強調表示
  const tileClassName = ({ date }) => {
    const dateStr = date.toISOString().split("T")[0];
    if (mode === "multi" && multiDates.includes(dateStr)) {
      return "selected-date"; // CSSでハイライト
    }
    return null;
  };

  const handleShare = async () => {
    const dates = mode === "range" ? generateRange() : multiDates;
    if (dates.length === 0) {
      alert("日程を選択してください");
      return;
    }

    const res = await fetch("/api/sharelink", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dates, category: "終日" }),
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
        <Calendar
          selectRange={true}
          onChange={setRangeDates}
          value={rangeDates}
        />
      )}

      {mode === "multi" && (
        <Calendar
          selectRange={false}
          onClickDay={handleMultiClick}
          tileClassName={tileClassName}
        />
      )}

      <button onClick={handleShare}>共有リンクを発行</button>

      <style jsx>{`
        .selected-date {
          background: #4caf50 !important;
          color: white !important;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
}
