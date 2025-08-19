import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function ShareLinkPage() {
  const { linkId } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [username, setUsername] = useState("");
  const [timeslot, setTimeslot] = useState("終日");
  const [selectedDates, setSelectedDates] = useState([]);
  const [mode, setMode] = useState("multi");
  const [title, setTitle] = useState("");

  // 日付フォーマット
  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // データ取得
  const fetchSchedules = async () => {
    try {
      const res = await axios.get(`/api/schedules/${linkId}`);
      setTitle(res.data.title);
      setSchedules(res.data.schedules);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [linkId]);

  // 登録処理
  const handleRegister = async () => {
    try {
      for (let d of selectedDates) {
        await axios.post(`/api/schedules/${linkId}`, {
          username,
          date: d,
          timeslot,
        });
      }
      fetchSchedules();
    } catch (err) {
      console.error(err);
    }
  };

  // 削除処理
  const handleDelete = async (date, timeslot) => {
    try {
      await axios.delete(`/api/schedules/${linkId}`, {
        data: { username, date, timeslot },
      });
      fetchSchedules();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>共有スケジュールページ</h2>
      <h3>タイトル: {title}</h3>

      <div>
        <label>名前: </label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="あなたの名前"
        />
      </div>

      <div>
        <label>モード: </label>
        <label>
          <input
            type="radio"
            value="multi"
            checked={mode === "multi"}
            onChange={() => setMode("multi")}
          />
          複数選択
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
        onChange={(value) => {
          if (mode === "range") {
            if (Array.isArray(value)) {
              const [start, end] = value;
              const dates = [];
              let current = new Date(start);
              while (current <= end) {
                dates.push(formatDate(current));
                current.setDate(current.getDate() + 1);
              }
              setSelectedDates(dates);
            }
          }
        }}
        onClickDay={(value) => {
          if (mode === "multi") {
            const fd = formatDate(value);
            setSelectedDates((prev) =>
              prev.includes(fd)
                ? prev.filter((d) => d !== fd)
                : [...prev, fd]
            );
          }
        }}
        value={null}
        selectRange={mode === "range"}
        tileClassName={({ date }) =>
          selectedDates.includes(formatDate(date)) ? "selected-day" : null
        }
      />

      <div>
        <label>時間帯: </label>
        <select
          value={timeslot}
          onChange={(e) => setTimeslot(e.target.value)}
        >
          <option value="終日">終日</option>
          <option value="昼">昼</option>
          <option value="夜">夜</option>
        </select>
      </div>

      <button onClick={handleRegister}>登録</button>

      <h3>登録一覧</h3>
      <table border="1" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>日付</th>
            <th>時間帯</th>
            <th>名前</th>
            <th>削除</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((s, idx) => (
            <tr key={idx}>
              <td>{s.date}</td>
              <td>{s.timeslot}</td>
              <td>{s.username}</td>
              <td>
                {s.username === username && (
                  <button onClick={() => handleDelete(s.date, s.timeslot)}>
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
