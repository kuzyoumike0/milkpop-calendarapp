import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function LinkPage() {
  const [dates, setDates] = useState([]); // 複数選択用
  const [range, setRange] = useState([null, null]); // 範囲選択用
  const [mode, setMode] = useState("multiple"); // "multiple" or "range"
  const [title, setTitle] = useState("");
  const [timeslot, setTimeslot] = useState("全日");
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState(null);

  // 日付クリック処理（複数選択）
  const handleDateClick = (date) => {
    if (mode === "multiple") {
      const dateStr = date.toISOString().split("T")[0];
      if (dates.includes(dateStr)) {
        setDates(dates.filter((d) => d !== dateStr));
      } else {
        setDates([...dates, dateStr]);
      }
    }
  };

  // 範囲選択処理
  const handleRangeChange = (rangeVal) => {
    if (mode === "range") {
      setRange(rangeVal);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload =
        mode === "range"
          ? {
              title,
              start_date: range[0]?.toISOString().split("T")[0],
              end_date: range[1]?.toISOString().split("T")[0],
              timeslot,
              range_mode: "range",
            }
          : {
              title,
              start_date: dates[0],
              end_date: dates[dates.length - 1],
              timeslot,
              range_mode: "multiple",
            };

      const res = await axios.post("/api/schedule", payload);
      setLink(`${window.location.origin}/share/${res.data.linkid}`);
    } catch (err) {
      console.error("登録失敗:", err);
      alert("登録に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-[#111] text-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-[#FDB9C8]">日程登録</h2>

      <input
        type="text"
        placeholder="タイトルを入力"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 mb-4 rounded bg-black border border-gray-700"
      />

      {/* モード切替 */}
      <div className="flex space-x-4 mb-4">
        <label>
          <input
            type="radio"
            checked={mode === "multiple"}
            onChange={() => setMode("multiple")}
          />{" "}
          複数選択
        </label>
        <label>
          <input
            type="radio"
            checked={mode === "range"}
            onChange={() => setMode("range")}
          />{" "}
          範囲選択
        </label>
      </div>

      {/* カレンダー */}
      <Calendar
        selectRange={mode === "range"}
        onClickDay={handleDateClick}
        onChange={handleRangeChange}
        value={mode === "range" ? range : null}
        tileClassName={({ date }) => {
          const dateStr = date.toISOString().split("T")[0];
          if (dates.includes(dateStr)) {
            return "bg-[#FDB9C8] text-black rounded-full";
          }
          return "";
        }}
      />

      {/* 時間帯プルダウン */}
      <select
        value={timeslot}
        onChange={(e) => setTimeslot(e.target.value)}
        className="w-full p-2 mt-4 rounded bg-black border border-gray-700"
      >
        <option value="全日">全日</option>
        <option value="昼">昼</option>
        <option value="夜">夜</option>
      </select>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full mt-6 py-2 bg-[#004CA0] hover:bg-[#FDB9C8] text-white font-bold rounded-lg transition"
      >
        {loading ? "登録中..." : "共有リンク発行"}
      </button>

      {link && (
        <p className="mt-4 text-center">
          共有リンク:{" "}
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#FDB9C8] underline"
          >
            {link}
          </a>
        </p>
      )}
    </div>
  );
}
