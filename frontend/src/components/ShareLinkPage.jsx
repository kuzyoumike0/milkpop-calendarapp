import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function ShareLinkPage() {
  const { linkId } = useParams();
  const [date, setDate] = useState(new Date());
  const [username, setUsername] = useState("");
  const [timeSlot, setTimeSlot] = useState("全日");
  const [mode, setMode] = useState("single");
  const [selectedDates, setSelectedDates] = useState([]);
  const [schedules, setSchedules] = useState([]);

  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const res = await axios.get(`/api/schedules/${linkId}`);
      setSchedules(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDateChange = (value) => {
    if (mode === "single") {
      setSelectedDates([formatDate(value)]);
    } else if (mode === "multi") {
      const fd = formatDate(value);
      setSelectedDates((prev) =>
        prev.includes(fd) ? prev.filter((d) => d !== fd) : [...prev, fd]
      );
    } else if (mode === "range" && Array.isArray(value)) {
      const [start, end] = value;
      const dates = [];
      let cur = new Date(start);
      while (cur <= end) {
        dates.push(formatDate(new Date(cur)));
        cur.setDate(cur.getDate() + 1);
      }
      setSelectedDates(dates);
    }
    setDate(value);
  };

  const saveSchedule = async () => {
    try {
      await axios.post(`/api/schedules/${linkId}`, {
        username,
        dates: selectedDates,
        timeslot: timeSlot,
      });
      loadSchedules();
    } catch (err) {
      console.error(err);
      alert("保存失敗");
    }
  };

  const deleteSchedule = async (date, timeslot) => {
    try {
      await axios.delete(`/api/schedules/${linkId}`, {
        data: { username, date, timeslot },
      });
      loadSchedules();
    } catch (err) {
      console.error(err);
      alert("削除失敗");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>共有カレンダー</h2>
      <p>リンクID: {linkId}</p>

      <div>
        <label>名前: </label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div>
        <label>時間帯: </label>
        <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
          <option value="全日">全日</option>
          <option value="昼">昼</option>
          <option value="夜">夜</option>
        </select>
      </div>

      <div>
        <label>
          <input
            type="radio"
            value="single"
            checked={mode === "single"}
            onChange={() => setMode("single")}
          />
          単日
        </label>
        <label>
          <input
            type="radio"
            value="multi"
            checked={mode === "multi"}
            onChange={() => setMode("multi")}
          />
          複数
        </label>
        <label>
          <input
            type="radio"
            value="range"
            checked={mode === "range"}
            onChange={() => setMode("range")}
          />
          範囲
        </label>
      </div>

      <Calendar
        onChange={handleDateChange}
        value={date}
        selectRange={mode === "range"}
        tileClassName={({ date }) =>
          selectedDates.includes(formatDate(date)) ? "selected-day" : null
        }
      />

      <button onClick={saveSchedule}>登録</button>

      <h3>登録一覧</h3>
      <table border="1" style={{ width: "100%", textAlign: "center" }}>
        <thead>
          <tr>
            <th>日付</th>
            <th>時間帯</th>
            <th>名前</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((s, i) => (
            <tr key={i}>
              <td>{s.date}</td>
              <td>{s.timeslot}</td>
              <td>{s.username}</td>
              <td>
                {s.username === username && (
                  <button onClick={() => deleteSchedule(s.date, s.timeslot)}>
                    削除
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
