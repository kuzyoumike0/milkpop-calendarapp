import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import DatePicker from "react-multi-date-picker";
import axios from "axios";
import "../custom-purple.css";

export default function LinkPage() {
  const [title, setTitle] = useState("");
  const [rangeMode, setRangeMode] = useState("range");
  const [date, setDate] = useState(new Date());
  const [dates, setDates] = useState([]);
  const [timeslot, setTimeslot] = useState("全日");
  const [link, setLink] = useState("");

  const handleSave = async () => {
    let selectedDates = [];
    if (rangeMode === "range") {
      if (Array.isArray(date)) {
        let d = new Date(date[0]);
        let end = new Date(date[1]);
        while (d <= end) {
          selectedDates.push(new Date(d));
          d.setDate(d.getDate() + 1);
        }
      } else {
        selectedDates = [date];
      }
    } else {
      selectedDates = dates;
    }

    const res = await axios.post("/api/schedule", {
      title,
      start_date: selectedDates[0]
        ? selectedDates[0].toISOString().split("T")[0]
        : null,
      end_date: selectedDates[selectedDates.length - 1]
        ? selectedDates[selectedDates.length - 1].toISOString().split("T")[0]
        : null,
      timeslot,
      range_mode: rangeMode,
    });

    // ✅ 修正: url ではなく link を参照
    setLink(res.data.link);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <header className="text-center text-3xl font-bold mb-6 text-[#FDB9C8]">
        MilkPOP Calendar - 日程登録
      </header>

      <div className="bg-[#004CA0] rounded-2xl p-6 shadow-lg mb-6">
        <input
          type="text"
          placeholder="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 mb-4 rounded text-black"
        />

        <div className="flex gap-4 mb-4">
          <label>
            <input
              type="radio"
              value="range"
              checked={rangeMode === "range"}
              onChange={() => setRangeMode("range")}
            />{" "}
            範囲選択
          </label>
          <label>
            <input
              type="radio"
              value="multiple"
              checked={rangeMode === "multiple"}
              onChange={() => setRangeMode("multiple")}
            />{" "}
            複数選択
          </label>
        </div>

        <div className="mb-4">
          {rangeMode === "range" ? (
            <Calendar onChange={setDate} value={date} selectRange />
          ) : (
            <DatePicker
              multiple
              value={dates}
              onChange={setDates}
              format="YYYY-MM-DD"
              className="custom-purple"
            />
          )}
        </div>

        <div className="mb-4">
          <select
            value={timeslot}
            onChange={(e) => setTimeslot(e.target.value)}
            className="p-2 rounded text-black"
          >
            <option value="全日">全日</option>
            <option value="昼">昼</option>
            <option value="夜">夜</option>
            <option value="時間指定">時間指定</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          className="bg-[#FDB9C8] text-black px-4 py-2 rounded-xl font-bold"
        >
          リンク発行
        </button>

        {link && (
          <p className="mt-4">
            ✅ 共有リンク:{" "}
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              className="underline text-[#FDB9C8]"
            >
              {link}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
