import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function LinkPage() {
  const [title, setTitle] = useState("");
  const [dates, setDates] = useState([]); // 複数選択保持
  const [range, setRange] = useState([null, null]); // 範囲選択保持
  const [mode, setMode] = useState("range"); // range or multi
  const [timeslot, setTimeslot] = useState("終日");
  const [shareUrl, setShareUrl] = useState("");

  // 日付フォーマット
  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // 日付クリック
  const handleDateChange = (value) => {
    if (mode === "multi") {
      const dateStr = formatDate(value);
      if (dates.includes(dateStr)) {
        setDates(dates.filter((d) => d !== dateStr));
      } else {
        setDates([...dates, dateStr]);
      }
    } else {
      setRange(value);
    }
  };

  // 登録
  const handleSubmit = async () => {
    try {
      let start_date, end_date;
      if (mode === "multi") {
        start_date = dates[0];
        end_date = dates[dates.length - 1];
      } else {
        start_date = formatDate(range[0]);
        end_date = formatDate(range[1]);
      }

      const res = await axios.post("/api/schedule", {
        title,
        start_date,
        end_date,
        timeslot,
        range_mode: mode,
      });
      setShareUrl(window.location.origin + res.data.url);
    } catch (err) {
      alert("登録失敗: " + err.message);
    }
  };

  // カレンダータイルに装飾
  const tileClassName = ({ date }) => {
    const dateStr = formatDate(date);
    if (mode === "multi" && dates.includes(dateStr)) {
      return "bg-[#FDB9C8] text-black rounded-full";
    }
    if (
      mode === "range" &&
      range[0] &&
      range[1] &&
      date >= range[0] &&
      date <= range[1]
    ) {
      return "bg-gradient-to-r from-[#FDB9C8] to-[#004CA0] text-white rounded-lg";
    }
    return "";
  };

  return (
    <div className="max-w-3xl mx-auto bg-[#111] text-white p-8 rounded-2xl shadow-xl space-y-6">
      <h2 className="text-2xl font-bold text-[#FDB9C8]">📅 日程登録ページ</h2>

      {/* タイトル入力 */}
      <input
        type="text"
        placeholder="タイトルを入力"
        className="w-full p-3 rounded-lg bg-black border border-[#FDB9C8] focus:outline-none focus:ring-2 focus:ring-[#004CA0]"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* モード切替 */}
      <div className="flex gap-6 items-center">
        <label>
          <input
            type="radio"
            name="mode"
            value="range"
            checked={mode === "range"}
            onChange={() => setMode("range")}
          />
          <span className="ml-2">範囲選択</span>
        </label>
        <label>
          <input
            type="radio"
            name="mode"
            value="multi"
            checked={mode === "multi"}
            onChange={() => setMode("multi")}
          />
          <span className="ml-2">複数選択</span>
        </label>
      </div>

      {/* カレンダー */}
      <div className="bg-black p-4 rounded-xl border border-[#004CA0]">
        <Calendar
          onChange={handleDateChange}
          value={mode === "range" ? range : null}
          selectRange={mode === "range"}
          tileClassName={tileClassName}
        />
      </div>

      {/* 時間帯プルダウン */}
      <select
        value={timeslot}
        onChange={(e) => setTimeslot(e.target.value)}
        className="w-full p-3 rounded-lg bg-black border border-[#FDB9C8] focus:outline-none focus:ring-2 focus:ring-[#004CA0]"
      >
        <option>終日</option>
        <option>昼</option>
        <option>夜</option>
      </select>

      {/* 登録ボタン */}
      <button
        onClick={handleSubmit}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FDB9C8] to-[#004CA0] text-white font-bold shadow-lg hover:scale-105 transition"
      >
        共有リンク発行
      </button>

      {/* 発行されたリンク表示 */}
      {shareUrl && (
        <div className="p-4 bg-black border border-[#FDB9C8] rounded-lg text-center">
          共有リンク:{" "}
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#FDB9C8] underline"
          >
            {shareUrl}
          </a>
        </div>
      )}
    </div>
  );
}
