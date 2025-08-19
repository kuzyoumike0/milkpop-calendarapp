import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function SharePage() {
  const [mode, setMode] = useState("range"); // range | multi
  const [rangeDates, setRangeDates] = useState([null, null]);
  const [multiDates, setMultiDates] = useState([]);

  const [category, setCategory] = useState("終日"); // 区分: 終日 | 昼 | 夜 | 時間帯
  const [startTime, setStartTime] = useState("01:00");
  const [endTime, setEndTime] = useState("00:00");

  // 時間リスト（01:00 ~ 00:00）
  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = (i + 1) % 24; // 1時から0時
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  // 範囲選択時の日付リスト
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

  // 複数選択クリック
  const handleMultiClick = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    if (multiDates.includes(dateStr)) {
      setMultiDates(multiDates.filter((d) => d !== dateStr));
    } else {
      setMultiDates([...multiDates, dateStr]);
    }
  };

  // 日付強調
  const tileClassName = ({ date }) => {
    const dateStr = date.toISOString().split("T")[0];
    if (mode === "multi" && multiDates.includes(dateStr)) {
      return "selected-date";
    }
    return null;
  };

  // 共有リンク発行
  const handleShare = async () => {
    const dates = mode === "range" ? generateRange() : multiDates;
    if (dates.length === 0) {
      alert("日程を選択してください");
      return;
    }

    const res = await fetch("/api/sharelink", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dates,
        category,
        startTime: category === "時間帯" ? startTime : null,
        endTime: category === "時間帯" ? endTime : null,
      }),
    });

    const data = await res.json();
    if (data.linkId) {
      alert(`共有リンク: ${window.location.origin}/share/${data.linkId}`);
    }
  };

  return (
    <div>
      <h2>日程の選択</h2>

      {/* 範囲選択 or 複数選択 */}
      <div>
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
      </div>

      {mode === "range" && (
        <Calendar selectRange={true} onChange={setRangeDates} value={rangeDates} />
      )}

      {mode === "multi" && (
        <Calendar
          selectRange={false}
          onClickDay={handleMultiClick}
          tileClassName={tileClassName}
        />
      )}

      <h2>区分の選択</h2>
      <div>
        <label>
          <input
            type="radio"
            value="終日"
            checked={category === "終日"}
            onChange={() => setCategory("終日")}
          />
          終日
        </label>
        <label>
          <input
            type="radio"
            value="昼"
            checked={category === "昼"}
            onChange={() => setCategory("昼")}
          />
          昼（13:00〜18:00）
        </label>
        <label>
          <input
            type="radio"
            value="夜"
            checked={category === "夜"}
            onChange={() => setCategory("夜")}
          />
          夜（21:00〜00:00）
        </label>
        <label>
          <input
            type="radio"
            value="時間帯"
            checked={category === "時間帯"}
            onChange={() => setCategory("時間帯")}
          />
          時間帯を指定
        </label>
      </div>

      {/* 時間帯プルダウン */}
      {category === "時間帯" && (
        <div>
          <label>
            開始:
            <select value={startTime} onChange={(e) => setStartTime(e.target.value)}>
              {timeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label>
            終了:
            <select value={endTime} onChange={(e) => setEndTime(e.target.value)}>
              {timeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        </div>
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
