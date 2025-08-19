import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function SharePage({ linkId }) {
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState("single"); // "single" or "multi"
  const [selectedDates, setSelectedDates] = useState([]); // 複数日選択
  const [timeSlot, setTimeSlot] = useState("全日");
  const [username, setUsername] = useState("");
  const [schedules, setSchedules] = useState([]);

  // === 日付フォーマット ===
  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // === DBからスケジュール取得 ===
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
  }, [linkId]);

  // === 日付クリック処理 ===
  const handleDateChange = (d) => {
    if (mode === "single") {
      setDate(d);
    } else {
      const fd = formatDate(d);
      if (selectedDates.includes(fd)) {
        setSelectedDates(selectedDates.filter((x) => x !== fd));
      } else {
        setSelectedDates([...selectedDates, fd]);
      }
    }
  };

  // === 保存処理 ===
  const handleSave = async () => {
    if (!username.trim()) {
      alert("名前を入力してください");
      return;
    }

    const datesToSave =
      mode === "single" ? [formatDate(date)] : selectedDates;

    try {
      for (const d of datesToSave) {
        await axios.post("/api/schedule", {
          username,
          date: d,
          timeslot: timeSlot,
          linkId,
        });
      }
      alert("保存しました！");
      setSelectedDates([]);
      fetchSchedules(); // 最新状態を反映
    } catch (err) {
      console.error(err);
      alert("保存に失敗しました");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>共有スケジュール登録</h2>

      {/* 名前入力 */}
      <div>
        <label>名前: </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      {/* モード選択 */}
      <div>
        <label>
          <input
            type="radio"
            value="single"
            checked={mode === "single"}
            onChange={() => setMode("single")}
          />
          範囲選択
        </label>
        <label>
          <input
            type="radio"
            value="multi"
            checked={mode === "multi"}
            onChange={() => setMode("multi")}
          />
          複数選択
        </label>
      </div>

      {/* カレンダー */}
      <Calendar
        onClickDay={handleDateChange}
        value={date}
        tileClassName={({ date }) => {
          const fd = formatDate(date);
          return selectedDates.includes(fd) ? "selected" : null;
        }}
      />

      {/* 時間帯選択 */}
      <div>
        <label>時間帯: </label>
        <select
          value={timeSlot}
          onChange={(e) => setTimeSlot(e.target.value)}
        >
          <option value="全日">全日</option>
          <option value="朝">朝</option>
          <option value="昼">昼</option>
          <option value="夜">夜</option>
        </select>
      </div>

      {/* 保存ボタン */}
      <button onClick={handleSave}>保存</button>

      {/* 一覧表示 */}
      <h3>登録一覧</h3>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>日付</th>
            <th>時間帯</th>
            <th>ユーザー</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((s, i) => (
            <tr key={i}>
              <td>{s.date}</td>
              <td>{s.timeslot}</td>
              <td>{s.username}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
