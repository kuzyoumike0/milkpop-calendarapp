import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function LinkPage() {
  const [title, setTitle] = useState("");
  const [dates, setDates] = useState([]); // 複数日選択または範囲選択
  const [rangeMode, setRangeMode] = useState("multiple");
  const [timeStart, setTimeStart] = useState("09:00");
  const [timeEnd, setTimeEnd] = useState("18:00");
  const [timeSlot, setTimeSlot] = useState("全日");
  const [link, setLink] = useState(null);

  // 日付選択処理
  const handleDateChange = (value) => {
    if (rangeMode === "range") {
      setDates(value);
    } else {
      setDates(value instanceof Array ? value : [value]);
    }
  };

  // 保存処理
  const handleSave = async () => {
    if (!title || dates.length === 0) {
      alert("タイトルと日付を入力してください");
      return;
    }
    if (timeSlot === "時間指定" && timeStart >= timeEnd) {
      alert("開始時刻は終了時刻より前にしてください");
      return;
    }

    const payload = {
      title,
      dates: Array.isArray(dates) ? dates : [dates],
      range_mode: rangeMode,
      timeslot: timeSlot === "時間指定" ? `${timeStart}〜${timeEnd}` : timeSlot,
    };

    const res = await axios.post("/api/schedule", payload);
    setLink(`${window.location.origin}/share/${res.data.linkid}`);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-[#FDB9C8]">日程登録ページ</h2>

      {/* タイトル入力 */}
      <input
        className="p-2 mb-4 w-full text-black rounded"
        placeholder="タイトルを入力"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* 範囲選択/複数選択モード */}
      <div className="mb-4">
        <label className="mr-4">
          <input
            type="radio"
            value="multiple"
            checked={rangeMode === "multiple"}
            onChange={() => setRangeMode("multiple")}
          />
          複数選択
        </label>
        <label>
          <input
            type="radio"
            value="range"
            checked={rangeMode === "range"}
            onChange={() => setRangeMode("range")}
          />
          範囲選択
        </label>
      </div>

      {/* カレンダー */}
      <div className="bg-[#111] p-4 rounded-lg shadow-md inline-block">
        <Calendar
          onChange={handleDateChange}
          selectRange={rangeMode === "range"}
          value={dates}
          locale="ja-JP"
          calendarType="gregory"
        />
      </div>

      {/* 時間帯プルダウン */}
      <div className="mt-6">
        <label className="block mb-2 text-[#004CA0] font-bold">時間帯</label>
        <select
          className="p-2 text-black rounded"
          value={timeSlot}
          onChange={(e) => setTimeSlot(e.target.value)}
        >
          <option value="全日">全日</option>
          <option value="昼">昼</option>
          <option value="夜">夜</option>
          <option value="時間指定">時間指定</option>
        </select>

        {timeSlot === "時間指定" && (
          <div className="flex space-x-2 mt-2">
            <select
              className="p-2 text-black rounded"
              value={timeStart}
              onChange={(e) => setTimeStart(e.target.value)}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={`${String(i).padStart(2, "0")}:00`}>
                  {i}:00
                </option>
              ))}
            </select>
            <span className="text-white">〜</span>
            <select
              className="p-2 text-black rounded"
              value={timeEnd}
              onChange={(e) => setTimeEnd(e.target.value)}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={`${String(i).padStart(2, "0")}:00`}>
                  {i}:00
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 保存ボタン */}
      <button onClick={handleSave} className="mt-6 btn-accent">
        登録してリンク発行
      </button>

      {/* 発行されたリンク表示 */}
      {link && (
        <div className="mt-4 p-4 bg-[#222] rounded-lg">
          <p className="text-[#FDB9C8]">共有リンクが発行されました:</p>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-[#004CA0]"
          >
            {link}
          </a>
        </div>
      )}
    </div>
  );
}
