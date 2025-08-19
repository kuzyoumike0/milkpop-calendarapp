import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function ShareLinkPage() {
  const { linkId } = useParams();
  const [mode, setMode] = useState("multi");
  const [selectedDates, setSelectedDates] = useState([]);
  const [range, setRange] = useState(null);
  const [username, setUsername] = useState("");
  const [timeSlot, setTimeSlot] = useState("終日");

  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleClickDay = (value) => {
    if (mode === "multi") {
      const fd = formatDate(value);
      setSelectedDates((prev) =>
        prev.includes(fd) ? prev.filter((d) => d !== fd) : [...prev, fd]
      );
    }
  };

  const handleRangeChange = (val) => {
    if (mode === "range") {
      setRange(val);
      if (val?.[0] && val?.[1]) {
        let d = new Date(val[0]);
        const arr = [];
        while (d <= val[1]) {
          arr.push(formatDate(new Date(d)));
          d.setDate(d.getDate() + 1);
        }
        setSelectedDates(arr);
      }
    }
  };

  const handleRegister = async () => {
    if (!username || selectedDates.length === 0) {
      alert("名前と日付を入力してください");
      return;
    }
    try {
      await axios.post(`/api/schedules/${linkId}`, {
        username,
        dates: selectedDates,
        timeslot: timeSlot,
      });
      alert("登録しました！");
      setSelectedDates([]);
    } catch (err) {
      console.error(err);
      alert("登録に失敗しました");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>共有カレンダー</h2>

      <label>
        名前:{" "}
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </label>

      <div>
        <label>
          <input
            type="radio"
            value="multi"
            checked={mode === "multi"}
            onChange={() => setMode("multi")}
          />
          複数日選択
        </label>
        <label>
          <input
            type="radio"
            value="range"
            checked={mode === "range"}
            onChange={() => setMode("range")}
          />
          範囲選択
        </label>
      </div>

      <Calendar
        onClickDay={handleClickDay}
        onChange={handleRangeChange}
        selectRange={mode === "range"}
        value={mode === "range" ? range : null}
        tileClassName={({ date }) =>
          selectedDates.includes(formatDate(date)) ? "selected-day" : null
        }
      />

      <div style={{ marginTop: 10 }}>
        <label>
          時間帯:{" "}
          <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
            <option value="終日">終日</option>
            <option value="昼">昼</option>
            <option value="夜">夜</option>
          </select>
        </label>
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>選択した日付:</h3>
        <ul>
          {selectedDates.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </div>

      <button onClick={handleRegister}>まとめて登録</button>
    </div>
  );
}
