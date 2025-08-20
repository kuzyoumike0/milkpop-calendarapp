import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import ShareButton from "./ShareButton";

export default function LinkPage() {
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [timeslot, setTimeslot] = useState("全日");
  const [rangeMode, setRangeMode] = useState("範囲選択");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [shareUrl, setShareUrl] = useState("");

  const handleDateChange = (value) => {
    if (rangeMode === "範囲選択") {
      if (Array.isArray(value)) {
        const [start, end] = value;
        let temp = [];
        let cur = new Date(start);
        while (cur <= end) {
          temp.push(new Date(cur));
          cur.setDate(cur.getDate() + 1);
        }
        setSelectedDates(temp);
      }
    } else if (rangeMode === "複数選択") {
      setSelectedDates((prev) =>
        prev.find((d) => d.toDateString() === value.toDateString())
          ? prev.filter((d) => d.toDateString() !== value.toDateString())
          : [...prev, value]
      );
    }
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post("/api/schedules/share", {
        title,
        dates: selectedDates.map((d) => d.toISOString().split("T")[0]),
        timeslot,
        startTime,
        endTime,
        rangeMode,
      });
      setShareUrl(`${window.location.origin}/share/${res.data.linkId}`);
    } catch (err) {
      alert("共有リンク作成に失敗しました");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <header className="text-center text-3xl font-bold text-[#FDB9C8] mb-6">
        MilkPOP Calendar - 日程登録
      </header>

      <div className="max-w-3xl mx-auto bg-[#004CA0] p-6 rounded-2xl shadow-lg space-y-6">
        <input
          type="text"
          placeholder="タイトルを入力"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 rounded-xl text-black"
        />

        <div className="flex space-x-4">
          <label>
            <input
              type="radio"
              value="範囲選択"
              checked={rangeMode === "範囲選択"}
              onChange={(e) => setRangeMode(e.target.value)}
            />
            範囲選択
          </label>
          <label>
            <input
              type="radio"
              value="複数選択"
              checked={rangeMode === "複数選択"}
              onChange={(e) => setRangeMode(e.target.value)}
            />
            複数選択
          </label>
        </div>

        <div className="bg-white rounded-xl p-4">
          <Calendar
            selectRange={rangeMode === "範囲選択"}
            onChange={handleDateChange}
          />
        </div>

        <div className="space-y-2">
          <label className="block">時間帯:</label>
          <select
            value={timeslot}
            onChange={(e) => setTimeslot(e.target.value)}
            className="p-2 text-black rounded-lg"
          >
            <option value="全日">全日</option>
            <option value="昼">昼</option>
            <option value="夜">夜</option>
            <option value="時間指定">時間指定</option>
          </select>

          {timeslot === "時間指定" && (
            <div className="flex space-x-2">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="p-2 text-black rounded-lg"
              />
              <span className="self-center">〜</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="p-2 text-black rounded-lg"
              />
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-[#FDB9C8] text-black rounded-xl font-bold hover:bg-pink-400"
        >
          保存 & 共有リンク発行
        </button>

        {shareUrl && <ShareButton url={shareUrl} />}
      </div>
    </div>
  );
}
