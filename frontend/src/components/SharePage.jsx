import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import ShareButton from "./ShareButton";
import Holidays from "date-holidays";

const hd = new Holidays("JP");

export default function SharePage() {
  const [title, setTitle] = useState("");
  const [timeslot, setTimeslot] = useState("全日");
  const [mode, setMode] = useState("multiple"); // "range" または "multiple"
  const [selectedDates, setSelectedDates] = useState([]);
  const [rangeDates, setRangeDates] = useState([null, null]);
  const [link, setLink] = useState("");

  // 祝日表示
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const holiday = hd.isHoliday(date);
      if (holiday) {
        return <p className="text-red-500 text-xs">{holiday[0].name}</p>;
      }
    }
    return null;
  };
  const tileClassName = ({ date, view }) => {
    if (view === "month" && hd.isHoliday(date)) {
      return "bg-red-100";
    }
    return null;
  };

  // カレンダー選択
  const handleDateChange = (value) => {
    if (mode === "range") {
      setRangeDates(value);
    } else {
      // 複数日
      if (selectedDates.some(d => d.getTime() === value.getTime())) {
        setSelectedDates(selectedDates.filter(d => d.getTime() !== value.getTime()));
      } else {
        setSelectedDates([...selectedDates, value]);
      }
    }
  };

  // 共有リンク発行
  const handleShare = () => {
    axios.post("/api/share").then(res => {
      setLink(res.data.url);
    });
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-[#004CA0]">日程登録ページ</h2>

      {/* タイトル入力 */}
      <input
        className="border p-2 w-full mt-2"
        placeholder="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* モード切り替え */}
      <div className="mt-4">
        <label className="mr-4">
          <input
            type="radio"
            name="mode"
            value="multiple"
            checked={mode === "multiple"}
            onChange={() => setMode("multiple")}
          /> 複数選択
        </label>
        <label>
          <input
            type="radio"
            name="mode"
            value="range"
            checked={mode === "range"}
            onChange={() => setMode("range")}
          /> 範囲選択
        </label>
      </div>

      {/* カレンダー */}
      <div className="mt-4">
        <Calendar
          selectRange={mode === "range"}
          onClickDay={handleDateChange}
          onChange={mode === "range" ? handleDateChange : undefined}
          value={mode === "range" ? rangeDates : null}
          tileContent={tileContent}
          tileClassName={tileClassName}
        />
      </div>

      {/* 時間帯 */}
      <select
        className="border p-2 w-full mt-2"
        value={timeslot}
        onChange={(e) => setTimeslot(e.target.value)}
      >
        <option>全日</option>
        <option>昼</option>
        <option>夜</option>
      </select>

      {/* 共有リンク発行 */}
      <button
        onClick={handleShare}
        className="bg-[#FDB9C8] px-4 py-2 rounded-xl mt-4"
      >
        共有リンク発行
      </button>

      {/* 発行されたリンクを表示 */}
      {link && <ShareButton link={link} />}
    </div>
  );
}
