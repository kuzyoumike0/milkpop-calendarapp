import React, { useState } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function SharePage() {
  const [link, setLink] = useState("");
  const [username, setUsername] = useState("");
  const [date, setDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState([]);
  const [mode, setMode] = useState("single");
  const [timeSlot, setTimeSlot] = useState("終日");
  const [startHour, setStartHour] = useState(0);
  const [endHour, setEndHour] = useState(1);

  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
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

  const createLinkAndSave = async () => {
    if (parseInt(endHour) <= parseInt(startHour)) {
      alert("終了時刻は開始時刻より後にしてください。");
      return;
    }

    try {
      const res = await axios.post("/api/create-link");
      const linkId = res.data.linkId;
      const url = `${window.location.origin}/share/${linkId}`;
      setLink(url);

      if (username && selectedDates.length > 0) {
        await axios.post(`/api/schedules/${linkId}`, {
          username,
          dates: selectedDates,
          timeslot: `${timeSlot} (${startHour}時〜${endHour}時)`,
        });
        alert("リンクを発行し、予定を登録しました！");
      } else {
        alert("リンクは発行されました。予定は未登録です。");
      }
    } catch (err) {
      console.error(err);
      alert("リンク作成失敗");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>共有リンク発行 & カレンダー登録</h2>

      {/* 名前入力 */}
      <div>
        <label>名前: </label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="名前を入力"
        />
      </div>

      {/* 時間帯プルダウン */}
      <div style={{ marginTop: "10px" }}>
        <label>時間帯: </label>
        <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
          <option value="終日">終日</option>
          <option value="昼">昼</option>
          <option value="夜">夜</option>
        </select>
      </div>

      {/* 開始〜終了プルダウン */}
      <div style={{ marginTop: "10px" }}>
        <label>開始時刻: </label>
        <select
          value={startHour}
          onChange={(e) => {
            const newStart = parseInt(e.target.value);
            setStartHour(newStart);
            if (parseInt(endHour) <= newStart) {
              setEndHour(newStart + 1); // 自動で1時間後に調整
            }
          }}
        >
          {Array.from({ length: 23 }, (_, i) => (
            <option key={i} value={i}>
              {i}時
            </option>
          ))}
        </select>

        <label style={{ marginLeft: "10px" }}>終了時刻: </label>
        <select value={endHour} onChange={(e) => setEndHour(parseInt(e.target.value))}>
          {Array.from({ length: 24 - (startHour + 1) }, (_, i) => {
            const hour = startHour + 1 + i;
            return (
              <option key={hour} value={hour}>
                {hour}時
              </option>
            );
          })}
        </select>
      </div>

      {/* カレンダーモード選択 */}
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

      {/* 発行ボタン */}
      <button style={{ marginTop: "10px" }} onClick={createLinkAndSave}>
        発行＋登録
      </button>

      {link && (
        <div style={{ marginTop: "10px" }}>
          <p>共有リンク:</p>
          <input value={link} readOnly style={{ width: "80%" }} />
        </div>
      )}
    </div>
  );
}
