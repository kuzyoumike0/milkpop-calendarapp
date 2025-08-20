import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function PersonalPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [dates, setDates] = useState([]);
  const [rangeMode, setRangeMode] = useState("multiple");
  const [timeSlot, setTimeSlot] = useState("全日");
  const [timeStart, setTimeStart] = useState("09:00");
  const [timeEnd, setTimeEnd] = useState("18:00");
  const [entries, setEntries] = useState([]);

  // DBから取得
  useEffect(() => {
    axios.get("/api/personal").then((res) => setEntries(res.data));
  }, []);

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
      memo,
      dates: Array.isArray(dates) ? dates : [dates],
      range_mode: rangeMode,
      timeslot: timeSlot === "時間指定" ? `${timeStart}〜${timeEnd}` : timeSlot,
    };

    await axios.post("/api/personal", payload);

    // 保存後すぐ反映
    const res = await axios.get("/api/personal");
    setEntries(res.data);

    // 入力クリア
    setTitle("");
    setMemo("");
    setDates([]);
    setTimeSlot("全日");
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-[#FDB9C8]">個人日程登録ページ</h2>

      {/* タイトル */}
      <input
        className="p-2 mb-4 w-full text-black rounded"
        placeholder="タイトルを入力"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* メモ */}
      <textarea
        className="p-2 mb-4 w-full text-black rounded"
        placeholder="メモを入力"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
      />

      {/* 範囲選択 / 複数選択 */}
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

      {/* 時間帯 */}
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
        保存
      </button>

      {/* 登録済みの予定一覧 */}
      <h3 className="text-xl mt-8 mb-2 text-[#004CA0]">登録済みの予定</h3>
      <div className="space-y-2">
        {entries.map((e, i) => (
          <div
            key={i}
            className="p-4 bg-[#111] rounded-lg border border-[#333] shadow-md"
          >
            <h4 className="font-bold text-[#FDB9C8]">{e.title}</h4>
            <p className="text-gray-300">{e.memo}</p>
            <p className="text-sm text-gray-400">
              {e.dates.join(", ")} / {e.timeslot}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
