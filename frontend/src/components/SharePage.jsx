import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import Holidays from "date-holidays";

const hd = new Holidays("JP");

export default function SharePage() {
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [timeslot, setTimeslot] = useState("全日");
  const [rangeMode, setRangeMode] = useState("複数");
  const [shareLink, setShareLink] = useState("");

  // ✅ 日付クリックで配列管理
  const handleDateClick = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    if (selectedDates.includes(dateStr)) {
      setSelectedDates(selectedDates.filter((d) => d !== dateStr));
    } else {
      setSelectedDates([...selectedDates, dateStr]);
    }
  };

  // ✅ 祝日赤表示 & 選択日を青にする
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const dateStr = date.toISOString().split("T")[0];
      if (hd.isHoliday(date)) {
        return "text-red-500 font-bold"; // 祝日
      }
      if (selectedDates.includes(dateStr)) {
        return "bg-blue-500 text-white rounded-full"; // 選択済み
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    if (!title || selectedDates.length === 0) {
      alert("タイトルと日付を入力してください。");
      return;
    }
    try {
      const res = await axios.post("/api/schedule", {
        title,
        dates: selectedDates,
        timeslot,
        range_mode: rangeMode,
      });
      setShareLink(res.data.link);
    } catch (err) {
      console.error("Error creating share schedule:", err);
      alert("登録に失敗しました");
    }
  };

  return (
    <div className="p-4 text-white">
      <h1 className="text-2xl font-bold mb-4">日程登録（共有リンク発行）</h1>

      <input
        type="text"
        placeholder="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 rounded text-black block mb-2"
      />

      {/* ✅ value を削除 */}
      <Calendar onClickDay={handleDateClick} tileClassName={tileClassName} />

      <div className="mt-4">
        <label className="mr-2">時間帯:</label>
        <select
          value={timeslot}
          onChange={(e) => setTimeslot(e.target.value)}
          className="text-black p-1 rounded"
        >
          <option value="全日">全日</option>
          <option value="昼">昼</option>
          <option value="夜">夜</option>
        </select>
      </div>

      <div className="mt-4">
        <label className="mr-2">選択モード:</label>
        <select
          value={rangeMode}
          onChange={(e) => setRangeMode(e.target.value)}
          className="text-black p-1 rounded"
        >
          <option value="複数">複数選択</option>
          <option value="範囲">範囲選択</option>
        </select>
      </div>

      <button
        onClick={handleSubmit}
        className="mt-4 bg-blue-600 px-4 py-2 rounded"
      >
        登録 & 共有リンク作成
      </button>

      {shareLink && (
        <div className="mt-4">
          <p>共有リンク:</p>
          <a href={shareLink} className="text-blue-400 underline">
            {window.location.origin}
            {shareLink}
          </a>
        </div>
      )}
    </div>
  );
}
