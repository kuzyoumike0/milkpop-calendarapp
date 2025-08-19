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
    try {
      await axios.post(`/api/schedules/${linkId}`, {
        username,
        dates: selectedDates,
        timeslot: "◯", // 登録済みを意味する
      });
      alert("登録しました！");
      setSelectedDates([]);
      fetchSchedules();
    } catch (err) {
      console.error(err);
      alert("登録失敗");
    }
  };

  // === マトリクス用 ===
  const users = [...new Set(schedules.map((s) => s.username))];
  const dates = [...new Set(schedules.map((s) => s.date))].sort();

  const getCellValue = (date, user) => {
    const entry = schedules.find((s) => s.date === date && s.username === user);
    return entry ? "◯" : "×";
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>共有スケジュールページ</h2>

      <div>
        <label>名前: </label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="名前を入力"
        />
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

      {selectedDates.length > 0 && (
        <div style={{ marginTop: "10px" }}>
          <b>選択済み日付:</b> {selectedDates.join(", ")}
        </div>
      )}

      <button style={{ marginTop: "10px" }} onClick={saveSchedule}>
        登録
      </button>

      {/* マトリクス表 */}
      <h3 style={{ marginTop: "20px" }}>登録一覧（◯×形式）</h3>
      <div style={{ overflowX: "auto" }}>
        <table border="1" style={{ borderCollapse: "collapse", minWidth: "600px" }}>
          <thead>
            <tr>
              <th>日付</th>
              {users.map((u, i) => (
                <th key={i}>{u}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dates.map((d, i) => (
              <tr key={i}>
                <td>{d}</td>
                {users.map((u, j) => (
                  <td key={j} style={{ textAlign: "center" }}>
                    {getCellValue(d, u)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
