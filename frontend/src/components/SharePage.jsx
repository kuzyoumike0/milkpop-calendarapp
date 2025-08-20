import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import useHolidays from "../hooks/useHolidays";

export default function SharePage() {
  const { linkid } = useParams();
  const [data, setData] = useState({ schedules: [], responses: [] });
  const [username, setUsername] = useState("");
  const [responses, setResponses] = useState({});
  const [date, setDate] = useState([]);
  const holidays = useHolidays();

  const fetchSharedData = async () => {
    const res = await axios.get(`/api/shared/${linkid}`);
    setData(res.data);
  };

  useEffect(() => {
    fetchSharedData();
  }, [linkid]);

  const handleSelect = (scheduleId, value) => {
    setResponses({ ...responses, [scheduleId]: value });
  };

  const handleSave = async () => {
    const payload = Object.keys(responses).map((sid) => ({
      schedule_id: sid,
      username,
      response: responses[sid],
    }));
    await axios.post("/api/shared", { responses: payload });
    fetchSharedData();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">共有ページ</h2>
      <input
        className="p-2 mb-4 w-full text-black rounded"
        placeholder="名前を入力"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <Calendar
        onChange={setDate}
        value={date}
        selectRange={true}
        tileClassName={({ date }) => {
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, "0");
          const dd = String(date.getDate()).padStart(2, "0");
          const key = `${yyyy}-${mm}-${dd}`;
          return holidays[key] ? "text-red-500 font-bold" : "";
        }}
      />

      <table className="w-full border text-center mt-6">
        <thead>
          <tr>
            <th>日付</th>
            <th>タイトル</th>
            <th>時間帯</th>
            <th>選択</th>
          </tr>
        </thead>
        <tbody>
          {data.schedules.map((s) => (
            <tr key={s.id}>
              <td>{s.date}</td>
              <td>{s.title}</td>
              <td>{s.timeslot}</td>
              <td>
                <select
                  className="text-black p-1 rounded"
                  onChange={(e) => handleSelect(s.id, e.target.value)}
                >
                  <option value="">選択</option>
                  <option value="〇">〇</option>
                  <option value="✖">✖</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={handleSave}
        className="mt-4 bg-[#FDB9C8] text-black px-4 py-2 rounded-xl"
      >
        保存
      </button>
    </div>
  );
}
