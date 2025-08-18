import React, { useState } from "react";
import Calendar from "react-calendar";
import axios from "axios";
import JapaneseHolidays from "japanese-holidays-js";

export default function PersonalPage() {
  const [date, setDate] = useState(new Date());
  const [title, setTitle] = useState("");

  const handleSave = async () => {
    await axios.post("/api/share-link", {
      dates: [date.toISOString().split("T")[0]],
      slotmode: "allday",
      slot: "終日",
      start_time: "09",
      end_time: "18",
      title,
      username: "user1"
    });
    alert("保存しました！");
  };

  return (
    <div className="page">
      <h2>個人スケジュール</h2>
      <Calendar
        onChange={setDate}
        value={date}
        tileClassName={({ date }) =>
          JapaneseHolidays.isHoliday(date)
            ? "holiday"
            : ""
        }
      />
      <input
        placeholder="予定タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button onClick={handleSave}>保存</button>
    </div>
  );
}
