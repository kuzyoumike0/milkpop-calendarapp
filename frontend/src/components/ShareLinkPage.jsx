import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function ShareLinkPage() {
  const { linkId } = useParams();
  const [username, setUsername] = useState("");
  const [date, setDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState([]);
  const [mode, setMode] = useState("single");
  const [timeSlot, setTimeSlot] = useState("終日");
  const [startHour, setStartHour] = useState(0);
  const [endHour, setEndHour] = useState(1);
  const [schedules, setSchedules] = useState([]);

  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const fetchSchedules = async () => {
    try {
      const res = await axios.get(`/api/schedules/${linkId}`);
      setSchedules(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

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
    if (!username || selectedDates.length === 0) {
      alert("名前と日付を入力してください");
      return;
    }
    if (parseInt(endHour) <= parseInt(startHour)) {
      alert("終了時刻は開始時刻より後にしてください。");
      return;
    }

    try {
      await axios.post(`/api/schedules/${linkId}`, {
        username,
        dates: selectedDates,
        timeslot: `${timeSlot} (${startHour}時〜${endHour}時)`,
      });
      alert("登録しました！");
      setSelectedDates([]);
      fetchSchedules();
    } catch (err) {
      console.error(err);
      alert("登録失敗");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>共有スケジュールページ</h2>

      {/* 名前入力 */}
      <div>
        <label>名前: </label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="名前を入力"
        />
      </div>

      {/* 時間帯 + 開始終了 */}
      <div style={{ marginTop: "10px" }}>
        <label>時間帯: </label>
        <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
          <option value="終日">終日</option>
          <option value="昼">昼</option>
          <option value="夜">夜</option>
        </select>

        <label style={{ marginLeft: "10px" }}>開始: </label>
        <select
          value={startHour}
          onChange={(e) => {
            const newStart = parseInt(e.target.value);
            setStartHour(newStart);
            if (endHour <= newStart) setEndHour(newStart + 1);
          }}
        >
          {Array.from({ length: 23 }, (_, i) => (
            <option key={i} value={i}>
              {i}時
            </option>
          ))}
        </select>

        <label style={{ marginLeft: "10px" }}>終了: </label>
        <select value={endHour} onChange={(e) => setEndHour(parseInt(e.target.value))}>
          {Array.from({ length: 23 - startHour }, (_, i) => {
            const hour = startHour + 1 + i;
            return (
              <option key={hour} value={hour}>
                {hour}時
              </option>
            );
          })}
        </select>
      </div>

      {/* カレンダーモード切替 */}
      <div style={{ marginTop: "10px" }}>
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

      {/* カレンダー */}
      <Calendar
        onChange={handleDateChange}
        value={date}
        selectRange={mode === "range"}
        tileClassName={({ date }) =>
          selectedDates.includes(formatDate(date)) ? "selected-day" : null
        }
      />

      {/* 選択済み日付リスト */}
      {selectedDates.length > 0 && (
        <div style={{ marginTop: "10px" }}>
          <b>選択済み日付:</b> {selectedDates.join(", ")}
        </div>
      )}

      <button style={{ marginTop: "10px" }} onClick={saveSchedule}>
        登録
      </button>

      {/* 登録一覧 */}
      <h3 style={{ marginTop: "20px" }}>登録一覧</h3>
      <table border="1" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>日付</th>
            <th>名前</th>
            <th>時間帯</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((s, i) => (
            <tr key={i}>
              <td>{s.date}</td>
              <td>{s.username}</td>
              <td>{s.timeslot}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
