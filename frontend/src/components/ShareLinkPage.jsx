import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function ShareLinkPage() {
  const { linkId } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [username, setUsername] = useState("");
  const [mode, setMode] = useState("multiple");
  const [dates, setDates] = useState([]);
  const [message, setMessage] = useState("");

  // データ取得
  const fetchSchedules = () => {
    axios.get(`/api/shared/${linkId}`)
      .then((res) => setSchedules(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchSchedules();
  }, [linkId]);

  // 追記フォーム送信
  const handleAdd = async () => {
    try {
      const formatted = dates.map((d) => d.toISOString().split("T")[0]);
      await axios.post(`/api/shared/${linkId}`, {
        username,
        mode,
        dates: formatted,
      });
      setMessage("✅ 追記しました！");
      fetchSchedules();
    } catch (err) {
      console.error(err);
      setMessage("❌ 追記に失敗しました");
    }
  };

  // 複数日クリック
  const handleMultipleChange = (date) => {
    const exists = dates.find((d) => d.toDateString() === date.toDateString());
    if (exists) {
      setDates(dates.filter((d) => d.toDateString() !== date.toDateString()));
    } else {
      setDates([...dates, date]);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>共有スケジュール</h2>

      {schedules.length === 0 ? (
        <p>データがありません</p>
      ) : (
        <ul>
          {schedules.map((s, i) => (
            <li key={i}>
              {s.username} : {new Date(s.schedule_date).toLocaleDateString()} ({s.mode})
            </li>
          ))}
        </ul>
      )}

      <hr />

      <h3>予定を追加する</h3>
      <input
        type="text"
        placeholder="名前"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ marginBottom: "10px" }}
      />

      <div style={{ marginBottom: "10px" }}>
        <label>
          <input
            type="radio"
            value="multiple"
            checked={mode === "multiple"}
            onChange={() => setMode("multiple")}
          />
          複数選択
        </label>
        <label style={{ marginLeft: "15px" }}>
          <input
            type="radio"
            value="range"
            checked={mode === "range"}
            onChange={() => setMode("range")}
          />
          範囲選択（※未実装例）
        </label>
      </div>

      <Calendar
        onClickDay={handleMultipleChange}
        tileClassName={({ date }) =>
          dates.find((d) => d.toDateString() === date.toDateString())
            ? "selected-day"
            : ""
        }
      />

      <button
        onClick={handleAdd}
        style={{ marginTop: "20px", padding: "8px 16px" }}
      >
        追加する
      </button>

      {message && <p>{message}</p>}

      <style>{`
        .selected-day {
          background: #007bff;
          color: white;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
}
