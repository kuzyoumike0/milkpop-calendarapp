import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function LinkPage() {
  const [title, setTitle] = useState("");
  const [dates, setDates] = useState([]); // 複数 or 範囲
  const [rangeMode, setRangeMode] = useState("single");
  const [timeSlots, setTimeSlots] = useState([]); // 選択された時間帯
  const [selectedTime, setSelectedTime] = useState("全日");
  const [customTime, setCustomTime] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  // 日付選択
  const handleDateChange = (date) => {
    if (rangeMode === "range") {
      setDates(date);
    } else {
      setDates(Array.isArray(date) ? date : [date]);
    }
  };

  // 時間帯追加
  const addTimeSlot = () => {
    const value = customTime || selectedTime;
    if (value && !timeSlots.includes(value)) {
      setTimeSlots([...timeSlots, value]);
    }
    setCustomTime("");
  };

  // 時間帯削除
  const removeTimeSlot = (slot) => {
    setTimeSlots(timeSlots.filter((s) => s !== slot));
  };

  // 登録処理
  const handleSubmit = async () => {
    try {
      const payload = {
        title,
        start_date:
          rangeMode === "range"
            ? dates[0].toISOString().slice(0, 10)
            : dates[0]?.toISOString().slice(0, 10),
        end_date:
          rangeMode === "range"
            ? dates[1].toISOString().slice(0, 10)
            : dates[dates.length - 1]?.toISOString().slice(0, 10),
        timeslot: timeSlots.join(","), // カンマ区切りで保存
      };

      const res = await axios.post("/api/schedule", payload);
      setLinkUrl(`${window.location.origin}/share/${res.data.linkid}`);
    } catch (err) {
      console.error(err);
      alert("登録に失敗しました");
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-[#111] text-white p-8 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-[#FDB9C8]">
        日程登録ページ
      </h2>

      {/* タイトル入力 */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">タイトル</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 rounded-xl text-black"
        />
      </div>

      {/* 範囲選択 / 複数選択 */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">日付選択モード</label>
        <div className="flex space-x-6">
          <label>
            <input
              type="radio"
              value="range"
              checked={rangeMode === "range"}
              onChange={(e) => setRangeMode(e.target.value)}
            />{" "}
            範囲選択
          </label>
          <label>
            <input
              type="radio"
              value="multiple"
              checked={rangeMode === "multiple"}
              onChange={(e) => setRangeMode(e.target.value)}
            />{" "}
            複数選択
          </label>
        </div>
      </div>

      {/* カレンダー */}
      <div className="mb-6 bg-black p-4 rounded-xl">
        <Calendar
          onChange={handleDateChange}
          selectRange={rangeMode === "range"}
          value={dates}
          tileClassName={({ date }) =>
            dates.some((d) => d.toDateString() === date.toDateString())
              ? "bg-[#FDB9C8] text-black rounded-full"
              : null
          }
        />
      </div>

      {/* 時間帯追加 */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">時間帯</label>
        <div className="flex space-x-4">
          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="p-2 rounded-xl text-black"
          >
            <option value="全日">全日</option>
            <option value="昼">昼</option>
            <option value="夜">夜</option>
          </select>
          <input
            type="text"
            placeholder="例: 9:00-12:00"
            value={customTime}
            onChange={(e) => setCustomTime(e.target.value)}
            className="p-2 rounded-xl text-black"
          />
          <button
            type="button"
            onClick={addTimeSlot}
            className="px-4 py-2 bg-[#FDB9C8] text-black font-bold rounded-xl hover:scale-105 transform transition"
          >
            追加
          </button>
        </div>

        {/* 選択中の時間帯リスト */}
        <div className="mt-4 flex flex-wrap gap-2">
          {timeSlots.map((slot) => (
            <span
              key={slot}
              className="bg-[#004CA0] px-3 py-1 rounded-full text-sm flex items-center"
            >
              {slot}
              <button
                onClick={() => removeTimeSlot(slot)}
                className="ml-2 text-red-400 hover:text-red-600"
              >
                ✖
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* 登録ボタン */}
      <div className="text-center">
        <button
          onClick={handleSubmit}
          className="px-6 py-3 bg-gradient-to-r from-[#FDB9C8] to-[#004CA0] rounded-xl font-bold hover:scale-105 transform transition"
        >
          登録して共有リンク発行
        </button>
      </div>

      {/* 発行されたリンク */}
      {linkUrl && (
        <div className="mt-6 text-center">
          <p className="mb-2">共有リンク:</p>
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#FDB9C8] underline"
          >
            {linkUrl}
          </a>
        </div>
      )}
    </div>
  );
}
