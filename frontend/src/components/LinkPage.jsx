import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import Holidays from "date-holidays";

const hd = new Holidays("JP");

export default function LinkPage() {
  const { linkId } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [username, setUsername] = useState("");

  useEffect(() => {
    axios
      .get(`/api/share/${linkId}`)
      .then((res) => setSchedules(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error("API error:", err);
        setSchedules([]);
      });
  }, [linkId]);

  const handleDateClick = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    if (selectedDates.includes(dateStr)) {
      setSelectedDates(selectedDates.filter((d) => d !== dateStr));
    } else {
      setSelectedDates([...selectedDates, dateStr]);
    }
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const dateStr = date.toISOString().split("T")[0];
      if (hd.isHoliday(date)) {
        return "text-red-500 font-bold";
      }
      if (selectedDates.includes(dateStr)) {
        return "bg-blue-500 text-white rounded-full";
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    if (!username || selectedDates.length === 0) {
      alert("名前と日付を入力してください。");
      return;
    }

    const selections = selectedDates.map((d) => ({
      date: d,
      timeslot: "全日",
      status: "◯",
    }));

    try {
      await axios.post(`/api/share/${linkId}`, { username, selections });
      alert("登録しました！");
      setSelectedDates([]);
    } catch (err) {
      console.error("Error saving selections:", err);
      alert("登録に失敗しました");
    }
  };

  return (
    <div className="p-4 text-white">
      <h1 className="text-2xl font-bold mb-4">共有スケジュール</h1>

      <Calendar
        onClickDay={handleDateClick}
        value={selectedDates.map((d) => new Date(d))}
        tileClassName={tileClassName}
      />

      <div className="mt-4">
        <input
          type="text"
          placeholder="名前を入力"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 rounded text-black"
        />
        <button
          onClick={handleSubmit}
          className="ml-2 bg-green-600 px-4 py-2 rounded"
        >
          登録
        </button>
      </div>

      <div className="mt-8 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold mb-4">登録済みスケジュール</h2>
        <ul className="space-y-2">
          {schedules.length > 0 ? (
            schedules.map((s, idx) => (
              <li key={idx} className="bg-gray-800 p-3 rounded-lg">
                <strong>{s.title}</strong> ({s.timeslot})<br />
                {s.date}
              </li>
            ))
          ) : (
            <li className="text-gray-400">スケジュールはまだありません。</li>
          )}
        </ul>
      </div>
    </div>
  );
}
