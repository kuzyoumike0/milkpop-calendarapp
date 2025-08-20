import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { ja } from "date-fns/locale";
import { format } from "date-fns";
import "./CalendarStyle.css"; // holiday スタイル用

export default function PersonalPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [dates, setDates] = useState([]);
  const [rangeMode, setRangeMode] = useState("multiple");
  const [timeSlot, setTimeSlot] = useState("全日");
  const [schedules, setSchedules] = useState([]);

  // 日本の祝日を取得して赤表示
  const [holidays, setHolidays] = useState({});
  useEffect(() => {
    const year = new Date().getFullYear();
    axios
      .get(`https://holidays-jp.github.io/api/v1/${year}/date.json`)
      .then((res) => setHolidays(res.data))
      .catch(() => setHolidays({}));
  }, []);

  // カレンダー選択
  const handleDateChange = (value) => {
    if (rangeMode === "multiple") {
      const newDates = Array.isArray(value) ? value : [value];
      setDates(newDates);
    } else if (rangeMode === "range") {
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

  // 保存
  const handleSave = async () => {
    if (!title || dates.length === 0) {
      alert("タイトルと日程を入力してください");
      return;
    }

    try {
      await axios.post("/api/personal", {
        title,
        memo,
        dates: dates.map((d) => format(d, "yyyy-MM-dd")),
        range_mode: rangeMode,
        timeslot: timeSlot,
      });
      setTitle("");
      setMemo("");
      setDates([]);
      fetchSchedules();
    } catch (err) {
      console.error(err);
      alert("保存に失敗しました");
    }
  };

  // 登録済みのスケジュール取得
  const fetchSchedules = async () => {
    try {
      const res = await axios.get("/api/personal");
      setSchedules(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // 日曜と祝日を赤表示
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
        MilkPOP Calendar - 個人スケジュール
      </header>

      <div className="bg-[#004CA0] p-6 rounded-2xl shadow-lg max-w-2xl mx-auto">
        <input
          type="text"
          placeholder="タイトルを入力"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 mb-4 rounded-lg text-black"
        />

        <textarea
          placeholder="メモを入力"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
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
          保存
        </button>
      </div>

      <div className="mt-8 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold mb-4">登録済みスケジュール</h2>
        <ul className="space-y-2">
          {schedules.map((s, idx) => (
            <li key={idx} className="bg-gray-800 p-3 rounded-lg">
              <strong>{s.title}</strong> ({s.timeslot})<br />
              {s.memo && <em>{s.memo}</em>}<br />
              {Array.isArray(s.dates) ? s.dates.join(", ") : s.date}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
