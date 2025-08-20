import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function PersonalPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [date, setDate] = useState([]);
  const [timeSlot, setTimeSlot] = useState("全日");
  const [events, setEvents] = useState([]);

  // DBから予定を取得
  const fetchEvents = async () => {
    const res = await axios.get("/api/personal");
    setEvents(res.data);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // 保存処理
  const handleSave = async () => {
    await axios.post("/api/personal", {
      title,
      memo,
      dates: Array.isArray(date) ? date : [date],
      timeslot: timeSlot,
    });

    // 保存後すぐ反映
    fetchEvents();

    // 入力フォームリセット
    setTitle("");
    setMemo("");
    setDate([]);
    setTimeSlot("全日");
  };

  return (
    <div className="p-6 text-white bg-black min-h-screen">
      <h1 className="text-2xl font-bold mb-4">個人日程登録</h1>

      <input
        className="p-2 mb-2 w-full text-black rounded"
        placeholder="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="p-2 mb-2 w-full text-black rounded"
        placeholder="メモ"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
      />

      <Calendar onChange={setDate} value={date} selectRange={true} />

      <div className="mt-2">
        <label className="mr-2">
          <input
            type="radio"
            value="全日"
            checked={timeSlot === "全日"}
            onChange={(e) => setTimeSlot(e.target.value)}
          />
          全日
        </label>
        <label className="mr-2">
          <input
            type="radio"
            value="昼"
            checked={timeSlot === "昼"}
            onChange={(e) => setTimeSlot(e.target.value)}
          />
          昼
        </label>
        <label>
          <input
            type="radio"
            value="夜"
            checked={timeSlot === "夜"}
            onChange={(e) => setTimeSlot(e.target.value)}
          />
          夜
        </label>
      </div>

      <button
        onClick={handleSave}
        className="mt-4 bg-[#004CA0] hover:bg-[#FDB9C8] text-white px-4 py-2 rounded-xl"
      >
        保存
      </button>

      <h2 className="text-xl mt-6 mb-2">登録済み日程</h2>
      <ul className="space-y-2">
        {events.map((ev, i) => (
          <li key={i} className="p-2 bg-[#222] rounded-xl">
            <p className="font-bold">{ev.title}</p>
            <p>{ev.memo}</p>
            <p>{ev.date}（{ev.timeslot}）</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
