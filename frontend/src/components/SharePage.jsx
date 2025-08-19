import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import io from "socket.io-client";

const socket = io();

export default function SharePage() {
  const [date, setDate] = useState(new Date());
  const [title, setTitle] = useState("");
  const [timeMode, setTimeMode] = useState("終日");
  const [startHour, setStartHour] = useState("1");
  const [endHour, setEndHour] = useState("24");
  const [selectionMode, setSelectionMode] = useState("single"); // single | range
  const [schedules, setSchedules] = useState([]);
  const [shareLink, setShareLink] = useState("");

  // ===== データ取得 =====
  const fetchData = async () => {
    try {
      const res = await axios.get("/api/schedules");
      setSchedules(res.data);
    } catch (err) {
      console.error("取得失敗:", err);
    }
  };

  useEffect(() => {
    fetchData();
    socket.on("update", () => {
      fetchData();
    });
    return () => {
      socket.off("update");
    };
  }, []);

  // ===== 日程登録 =====
  const handleRegister = async () => {
    if (!title) {
      alert("タイトルを入力してください");
      return;
    }

    let selectedDates = [];
    if (selectionMode === "range" && Array.isArray(date)) {
      const [start, end] = date;
      let d = new Date(start);
      while (d <= end) {
        selectedDates.push(new Date(d));
        d.setDate(d.getDate() + 1);
      }
    } else {
      selectedDates = Array.isArray(date) ? date : [date];
    }

    try {
      await axios.post("/api/schedules", {
        dates: selectedDates.map((d) =>
          d.toISOString().split("T")[0]
        ),
        title,
        timemode: timeMode,
        starthour: startHour,
        endhour: endHour,
      });
      setTitle("");
      setTimeMode("終日");
      setStartHour("1");
      setEndHour("24");
    } catch (err) {
      console.error("登録失敗:", err);
    }
  };

  // ===== 共有リンク発行 =====
  const handleShare = async () => {
    try {
      const res = await axios.post("/api/share");
      setShareLink(`${window.location.origin}/share/${res.data.linkId}`);
    } catch (err) {
      console.error("リンク発行失敗:", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>共有リンク発行ページ</h2>

      {/* ラジオボタンでモード切替 */}
      <div style={{ marginBottom: "10px" }}>
        <label>
          <input
            type="radio"
            value="single"
            checked={selectionMode === "single"}
            onChange={() => setSelectionMode("single")}
          />
          複数選択
        </label>
        <label style={{ marginLeft: "10px" }}>
          <input
            type="radio"
            value="range"
            checked={selectionMode === "range"}
            onChange={() => setSelectionMode("range")}
          />
          範囲選択
        </label>
      </div>

      {/* カレンダー */}
      <Calendar
        onChange={setDate}
        value={date}
        selectRange={selectionMode === "range"}
      />

      {/* タイトル入力 */}
      <div style={{ marginTop: "10px" }}>
        <input
          type="text"
          placeholder="タイトルを入力"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: "5px", width: "250px" }}
        />
      </div>

      {/* 時間帯選択 */}
      <div style={{ marginTop: "10px" }}>
        <select
          value={timeMode}
          onChange={(e) => setTimeMode(e.target.value)}
          style={{ padding: "5px" }}
        >
          <option value="終日">終日</option>
          <option value="昼">昼</option>
          <option value="夜">夜</option>
          <option value="時間指定">時間指定</option>
        </select>

        {timeMode === "時間指定" && (
          <span>
            <select
              value={startHour}
              onChange={(e) => setStartHour(e.target.value)}
              style={{ marginLeft: "10px" }}
            >
              {Array.from({ length: 24 }, (_, i) => i + 1).map((h) => (
                <option key={h} value={h}>
                  {h}時
                </option>
              ))}
            </select>
            〜
            <select
              value={endHour}
              onChange={(e) => setEndHour(e.target.value)}
              style={{ marginLeft: "10px" }}
            >
              {Array.from({ length: 24 }, (_, i) => i + 1).map((h) => (
                <option key={h} value={h}>
                  {h}時
                </option>
              ))}
            </select>
          </span>
        )}
      </div>

      {/* 登録ボタン */}
      <button
        onClick={handleRegister}
        style={{ marginTop: "10px", padding: "5px 10px" }}
      >
        登録
      </button>

      {/* 共有リンク */}
      <div style={{ marginTop: "20px" }}>
        <button
          onClick={handleShare}
          style={{ padding: "5px 10px" }}
        >
          共有リンクを発行
        </button>
        {shareLink && (
          <p>
            <a href={shareLink} target="_blank" rel="noopener noreferrer">
              {shareLink}
            </a>
          </p>
        )}
      </div>

      {/* 登録済み日程一覧 */}
      <h3>登録済み日程</h3>
      <ul>
        {schedules.map((s, i) => (
          <li key={i}>
            {s.date} {s.title} [{s.timemode}]
            {s.timemode === "時間指定" && ` ${s.starthour}時〜${s.endhour}時`}
          </li>
        ))}
      </ul>
    </div>
  );
}
