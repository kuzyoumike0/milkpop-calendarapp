import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import ja from "date-fns/locale/ja";   // ← 修正
import { format } from "date-fns";
import "./CalendarStyle.css";
import Header from "./Header";


export default function SharePage({ match }) {
  const { linkId } = match.params;
  const [username, setUsername] = useState("");
  const [dates, setDates] = useState([]);
  const [rangeMode, setRangeMode] = useState("multiple");
  const [timeSlot, setTimeSlot] = useState("全日");
  const [responses, setResponses] = useState([]);
  const [holidays, setHolidays] = useState({});

  // 日本の祝日データ
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

  // 回答保存
  const handleSave = async () => {
    if (!username || dates.length === 0) {
      alert("名前と日程を入力してください");
      return;
    }

    try {
      await axios.post(`/api/share/${linkId}`, {
        username,
        dates: dates.map((d) => format(d, "yyyy-MM-dd")),
        range_mode: rangeMode,
        timeslot: timeSlot,
      });
      setDates([]);
      fetchResponses();
    } catch (err) {
      console.error(err);
      alert("保存に失敗しました");
    }
  };

  // 回答取得
  const fetchResponses = async () => {
    try {
      const res = await axios.get(`/api/share/${linkId}`);
      setResponses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchResponses();
  }, [linkId]);

  // 祝日・日曜は赤
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
        MilkPOP Calendar - 共有スケジュール
      </header>

      <div className="bg-[#004CA0] p-6 rounded-2xl shadow-lg max-w-2xl mx-auto">
        <input
          type="text"
          placeholder="名前を入力"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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

      <div className="mt-8 max-w-4xl mx-auto">
        <h2 className="text-xl font-bold mb-4">回答一覧</h2>
        <table className="w-full border-collapse border border-gray-500">
          <thead>
            <tr className="bg-gray-700">
              <th className="border border-gray-500 p-2">名前</th>
              <th className="border border-gray-500 p-2">日程</th>
              <th className="border border-gray-500 p-2">時間帯</th>
            </tr>
          </thead>
          <tbody>
            {responses.map((r, idx) => (
              <tr key={idx} className="bg-gray-800">
                <td className="border border-gray-500 p-2">{r.username}</td>
                <td className="border border-gray-500 p-2">
                  {Array.isArray(r.dates) ? r.dates.join(", ") : r.date}
                </td>
                <td className="border border-gray-500 p-2">{r.timeslot}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
