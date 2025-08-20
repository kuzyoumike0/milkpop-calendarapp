import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function LinkPage() {
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [timeslot, setTimeslot] = useState("全日");
  const [shareLink, setShareLink] = useState("");

  const handleDateChange = (date) => {
    const iso = date.toISOString().split("T")[0];
    if (selectedDates.includes(iso)) {
      setSelectedDates(selectedDates.filter((d) => d !== iso));
    } else {
      setSelectedDates([...selectedDates, iso]);
    }
  };

  const saveSchedule = async () => {
    const res = await axios.post("/api/schedule", {
      title,
      dates: selectedDates,
      timeslot,
    });
    setShareLink(window.location.origin + res.data.link);
    setTitle("");
    setSelectedDates([]);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">共有スケジュール登録</h2>
      <input
        className="w-full p-2 rounded bg-black/20"
        placeholder="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Calendar onClickDay={handleDateChange} />
      <p>選択中: {selectedDates.join(", ")}</p>
      <select
        className="w-full p-2 rounded bg-black/20"
        value={timeslot}
        onChange={(e) => setTimeslot(e.target.value)}
      >
        <option>全日</option>
        <option>昼</option>
        <option>夜</option>
        <option>時間指定</option>
      </select>
      <button
        className="px-6 py-2 bg-blue-500 rounded shadow hover:bg-blue-600"
        onClick={saveSchedule}
      >
        共有リンクを発行
      </button>
      {shareLink && (
        <div className="p-4 bg-white/10 rounded">
          共有リンク:{" "}
          <a href={shareLink} className="underline text-pink-300">
            {shareLink}
          </a>
        </div>
      )}
    </div>
  );
}
