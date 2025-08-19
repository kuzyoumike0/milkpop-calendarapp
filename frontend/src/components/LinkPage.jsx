import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function LinkPage() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date());
  const [rangeMode, setRangeMode] = useState("single");
  const [timeslot, setTimeslot] = useState("全日");
  const [shareLink, setShareLink] = useState("");

  const handleShare = async () => {
    const formattedDate = date.toISOString().split("T")[0];
    const res = await axios.post("/api/share", {
      title,
      date: formattedDate,
      timeslot,
      rangeMode,
    });
    setShareLink(window.location.origin + res.data.link);
  };

  return (
    <div>
      <h2>日程登録</h2>
      <div>
        タイトル:{" "}
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <Calendar value={date} onChange={setDate} />
      <div>
        範囲選択:{" "}
        <label>
          <input
            type="radio"
            name="range"
            value="single"
            checked={rangeMode === "single"}
            onChange={() => setRangeMode("single")}
          />
          単日
        </label>
        <label>
          <input
            type="radio"
            name="range"
            value="multiple"
            checked={rangeMode === "multiple"}
            onChange={() => setRangeMode("multiple")}
          />
          複数日
        </label>
      </div>
      <div>
        時間帯:{" "}
        <select value={timeslot} onChange={(e) => setTimeslot(e.target.value)}>
          <option>全日</option>
          <option>昼</option>
          <option>夜</option>
          <option>1時-0時</option>
        </select>
      </div>
      <button onClick={handleShare}>共有リンク発行</button>
      {shareLink && (
        <div>
          <p>共有リンク:</p>
          <a href={shareLink} target="_blank" rel="noreferrer">
            {shareLink}
          </a>
        </div>
      )}
    </div>
  );
}
