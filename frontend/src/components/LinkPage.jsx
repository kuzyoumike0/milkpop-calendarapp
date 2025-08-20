import Header from "./Header";
import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { ja } from "date-fns/locale";
import { format } from "date-fns";
import "./CalendarStyle.css"; // デザイン拡張用（後述）

export default function LinkPage() {
  const [title, setTitle] = useState("");
  const [dates, setDates] = useState([]);
  const [rangeMode, setRangeMode] = useState("multiple");
  const [timeSlot, setTimeSlot] = useState("全日");
  const [shareUrl, setShareUrl] = useState("");
  const [schedules, setSchedules] = useState([]);

  // 日本の祝日APIから取得して赤色表示
  const [holidays, setHolidays] = useState({});
  useEffect(() => {
    const year = new Date().getFullYear();
    axios
      .get(`https://holidays-jp.github.io/api/v1/${year}/date.json`)
      .then((res) => setHolidays(res.data))
      .catch(() => setHolidays({}));
  }, []);

  // カレンダー選択ハンドラ
  const handleDateChange = (value) => {
    if (rangeMode === "multiple") {
      // 複数選択モード
      const newDates = Array.isArray(value) ? value : [value];
      setDates(newDates);
    } else if (rangeMode === "range") {
      // 範囲選択モード
      if (Array.isArray(value) && value.length === 2) {
        const [start, end] = value;
        let cur = new Date(start);
        const range = [];
        while (cur <= end) {
          range.push(new Date(cur));
          cur.setDate(cur.getDate() + 1);
        }
        setDates(range);
      }
    }
  };

  // スケジュール登録
  const handleSave = async () => {
    if (!title || dates.length === 0) {
      alert("タイトルと日程を入力してください");
      return;
    }

    try {
      const res = await axios.post("/api/schedules", {
        title,
        dates: dates.map((d) => format(d, "yyyy-MM-dd")),
        range_mode: rangeMode,
        timeslot: timeSlot,
      });
      setShareUrl(`${window.location.origin}/share/${res.data.linkId}`);
      fetchSchedules();
    } catch (err) {
      console.error(err);
      alert("保存に失敗しました");
    }
  };

  // 登録済みスケジュール取得
  const fetchSchedules = async () => {
    try {
      const res = await axios.get("/api/schedules");
      setSchedules(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // 祝日 or 日曜日は赤色クラス
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const ymd = format(date, "yyyy-MM-dd");
      if (holidays[ymd] || date.getDay() === 0) {
        return "holiday";
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <header className="text-center text-3xl font-bold mb-6 text-[#FDB9C8]">
        MilkPOP Calendar - 共有スケジュール登録
      </header>

      <div className="bg-[#004CA0] p-6 rounded-2xl shadow-lg max-w-2xl mx-auto">
        <input
          type="text"
          placeholder="タイトルを入力"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 mb-4 rounded-lg text-black"
        />

        <div className="flex gap-4 mb-4">
          <label>
            <input
              type="radio"
              value="multiple"
              checked={rangeMode === "multiple"}
              onChange={(e) => setRangeMode(e.target.value)}
            />
            複数選択
          </label>
          <label>
            <input
              type="radio"
              value="range"
              checked={rangeMode === "range"}
              onChange={(e) => setRangeMode(e.target.value)}
            />
            範囲選択
          </label>
        </div>

        <Calendar
          onChange={handleDateChange}
          selectRange={rangeMode === "range"}
          tileClassName={tileClassName}
          value={dates}
          locale={ja}
        />

        <div className="mt-4">
          <label className="block mb-2">時間帯を選択:</label>
          <select
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
            className="p-2 rounded-lg text-black"
          >
            <option value="全日">全日</option>
            <option value="昼">昼</option>
            <option value="夜">夜</option>
            <option value="時間指定">1時〜0時</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          className="mt-6 w-full p-3 rounded-xl bg-[#FDB9C8] text-black font-bold hover:opacity-80"
        >
          共有リンク発行
        </button>

        {shareUrl && (
          <div className="mt-4">
            <p className="mb-2">発行された共有リンク:</p>
            <a href={shareUrl} className="underline text-[#FDB9C8]">
              {shareUrl}
            </a>
          </div>
        )}
      </div>

      <div className="mt-8 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold mb-4">登録済みスケジュール</h2>
        <ul className="space-y-2">
          {schedules.map((s, idx) => (
            <li key={idx} className="bg-gray-800 p-3 rounded-lg">
              <strong>{s.title}</strong> ({s.timeslot})<br />
              {Array.isArray(s.dates) ? s.dates.join(", ") : s.date}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
