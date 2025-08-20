import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function PersonalPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [timeslot, setTimeslot] = useState("全日");
  const [list, setList] = useState([]);

  const handleDateChange = (date) => {
    const iso = date.toISOString().split("T")[0];
    if (selectedDates.includes(iso)) {
      setSelectedDates(selectedDates.filter((d) => d !== iso));
    } else {
      setSelectedDates([...selectedDates, iso]);
    }
  };

  const saveSchedule = async () => {
    await axios.post("/api/personal-schedule", {
      title,
      memo,
      dates: selectedDates,
      timeslot,
    });
    fetchList();
    setTitle("");
    setMemo("");
    setSelectedDates([]);
  };

  const fetchList = async () => {
    const res = await axios.get("/api/personal-schedule");
    setList(res.data);
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">個人スケジュール登録</h2>
      <input
        className="w-full p-2 rounded bg-black/20"
        placeholder="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="w-full p-2 rounded bg-black/20"
        placeholder="メモ"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
      />
      <div>
        <Calendar onClickDay={handleDateChange} />
        <p>選択中: {selectedDates.join(", ")}</p>
      </div>
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
        className="px-6 py-2 bg-pink-400 rounded shadow hover:bg-pink-500"
        onClick={saveSchedule}
      >
        保存
      </button>

      <div>
        <h3 className="text-xl font-bold mt-6">保存済みスケジュール</h3>
        <ul className="space-y-2">
          {list.map((item) => (
            <li
              key={item.id}
              className="p-2 bg-white/10 rounded shadow flex justify-between"
            >
              <span>{item.date} {item.title} ({item.timeslot})</span>
              <span className="text-sm text-gray-300">{item.memo}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
