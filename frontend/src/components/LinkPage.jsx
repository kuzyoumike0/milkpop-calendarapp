import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import Holidays from "date-holidays";

const hd = new Holidays("JP");

export default function LinkPage() {
  const { linkid } = useParams();
  const [schedule, setSchedule] = useState([]);
  const [username, setUsername] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [rangeMode, setRangeMode] = useState("複数");
  const [rangeStart, setRangeStart] = useState(null);
  const [timeslot, setTimeslot] = useState("全日");

  useEffect(() => {
    axios
      .get(`/api/share/${linkid}`)
      .then((res) => setSchedule(res.data))
      .catch((err) => console.error("Error fetching schedule:", err));
  }, [linkid]);

  const handleDateClick = (date) => {
    const dateStr = date.toISOString().split("T")[0];

    if (rangeMode === "複数") {
      if (selectedDates.includes(dateStr)) {
        setSelectedDates(selectedDates.filter((d) => d !== dateStr));
      } else {
        setSelectedDates([...selectedDates, dateStr]);
      }
    } else if (rangeMode === "範囲") {
      if (!rangeStart) {
        setRangeStart(date);
        setSelectedDates([dateStr]);
      } else {
        const start = new Date(Math.min(rangeStart, date));
        const end = new Date(Math.max(rangeStart, date));
        const dates = [];
        let current = new Date(start);
        while (current <= end) {
          dates.push(current.toISOString().split("T")[0]);
          current.setDate(current.getDate() + 1);
        }
        setSelectedDates(dates);
        setRangeStart(null);
      }
    }
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const dateStr = date.toISOString().split("T")[0];
      if (hd.isHoliday(date)) return "text-red-500 font-bold";
      if (selectedDates.includes(dateStr))
        return "bg-blue-500 text-white rounded-full";
    }
    return null;
  };

  const handleSubmit = async () => {
    if (!username || selectedDates.length === 0) {
      alert("名前と日付を入力してください");
      return;
    }
    try {
      await axios.post(`/api/share/${linkid}`, {
        username,
        selections: selectedDates.map((d) => ({
          date: d,
          timeslot,
          status: "◯",
        })),
      });
      alert("登録しました！");
      setSelectedDates([]);
      setRangeStart(null);
    } catch (err) {
      console.error("Error saving selections:", err);
      alert("登録に失敗しました");
    }
  };

  return (
    <div className="p-4 text-white">
      <h1 className="text-2xl font-bold mb-4">共有スケジュール</h1>

      <Calendar onClickDay={handleDateClick} tileClassName={tileClassName} />

      <div className="mt-4">
        <label className="mr-2">名前:</label>
        <input
          type="text"
          placeholder="あなたの名前"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 rounded text-black"
        />
      </div>

      <div className="mt-4">
        <label className="mr-2">時間帯:</label>
        <select
          value={timeslot}
          onChange={(e) => setTimeslot(e.target.value)}
          className="text-black p-1 rounded"
        >
          <option value="全日">全日</option>
          <option value="昼">昼</option>
          <option value="夜">夜</option>
        </select>
      </div>

      <div className="mt-4">
        <label className="mr-2">選択モード:</label>
        <select
          value={rangeMode}
          onChange={(e) => {
            setRangeMode(e.target.value);
            setSelectedDates([]);
            setRangeStart(null);
          }}
          className="text-black p-1 rounded"
        >
          <option value="複数">複数選択</option>
          <option value="範囲">範囲選択</option>
        </select>
      </div>

      <button
        onClick={handleSubmit}
        className="mt-4 bg-green-600 px-4 py-2 rounded"
      >
        登録
      </button>

      <div className="mt-8 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold mb-4">登録済みスケジュール</h2>
        <ul className="space-y-2">
          {schedule.map((s, idx) => (
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
