// frontend/src/components/PersonalPage.jsx
import React, { useState, useEffect } from "react";
import Holidays from "date-holidays";
import "../personal.css";

const hd = new Holidays("JP");

const PersonalPage = () => {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [date, setDate] = useState(new Date());
  const [timeType, setTimeType] = useState("allday");
  const [events, setEvents] = useState([]);
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");

  // ローカルストレージからトークン取得
  const token = localStorage.getItem("jwt");

  // 予定取得
  useEffect(() => {
    if (!token) return;

    fetch("/api/personal-events", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("取得失敗");
        return res.json();
      })
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("取得失敗:", err);
        setEvents([]);
      });
  }, [token]);

  // 祝日判定（あとでカスタムカレンダーにするならここを拡張）
  const isHoliday = (date) => {
    const holiday = hd.isHoliday(date);
    return holiday ? holiday[0].name : null;
  };

  // イベント登録
  const handleRegister = () => {
    if (!title.trim()) return alert("タイトルを入力してください");

    const newEvent = {
      title,
      memo,
      dates: [
        {
          date: date.toISOString().split("T")[0],
          timeType,
          startTime: timeType === "custom" ? startTime : null,
          endTime: timeType === "custom" ? endTime : null,
        },
      ],
      options: {},
    };

    fetch("/api/personal-events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(newEvent),
    })
      .then((res) => {
        if (!res.ok) throw new Error("保存失敗");
        return res.json();
      })
      .then((saved) => {
        setEvents([...events, saved]);
        setTitle("");
        setMemo("");
      })
      .catch((err) => {
        console.error("保存失敗:", err);
        alert("保存に失敗しました");
      });
  };

  return (
    <div className="personal-page">
      <h1 className="page-title">個人日程登録ページ</h1>

      {/* タイトル入力 */}
      <input
        type="text"
        className="title-input"
        placeholder="タイトルを入力してください"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* メモ入力 */}
      <textarea
        className="memo-input"
        placeholder="メモを入力してください"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
      />

      {/* 簡易カレンダー（選択した日付を強調） */}
      <div className="calendar-list-container">
        <div className="calendar-container">
          <table className="custom-calendar">
            <thead>
              <tr>
                {["日", "月", "火", "水", "木", "金", "土"].map((w, i) => (
                  <th key={i}>{w}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, row) => (
                <tr key={row}>
                  {Array.from({ length: 7 }).map((_, col) => {
                    const d = new Date();
                    d.setDate(date.getDate() - date.getDay() + row * 7 + col);
                    const selected =
                      d.toDateString() === date.toDateString();
                    return (
                      <td
                        key={col}
                        className={selected ? "selected-date" : ""}
                        onClick={() => setDate(d)}
                      >
                        {d.getDate()}
                        <div className="holiday-name">{isHoliday(d)}</div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 選択中リスト */}
        <div className="list-container">
          <h2>登録済みの予定</h2>
          <ul>
            {events.map((ev, i) => (
              <li key={i}>
                <strong>{ev.dates?.[0]?.date}</strong>{" "}
                {ev.title} ({ev.dates?.[0]?.timeType})
                {ev.memo && <p className="memo-text">📝 {ev.memo}</p>}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 時間区分選択 */}
      <div className="time-options">
        <label>
          <input
            type="radio"
            value="allday"
            checked={timeType === "allday"}
            onChange={(e) => setTimeType(e.target.value)}
          />
          終日
        </label>
        <label>
          <input
            type="radio"
            value="day"
            checked={timeType === "day"}
            onChange={(e) => setTimeType(e.target.value)}
          />
          昼
        </label>
        <label>
          <input
            type="radio"
            value="night"
            checked={timeType === "night"}
            onChange={(e) => setTimeType(e.target.value)}
          />
          夜
        </label>
        <label>
          <input
            type="radio"
            value="custom"
            checked={timeType === "custom"}
            onChange={(e) => setTimeType(e.target.value)}
          />
          時間指定
        </label>
      </div>

      {timeType === "custom" && (
        <div className="custom-time">
          <select
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="cute-select"
          >
            {Array.from({ length: 24 }).map((_, i) => {
              const h = String(i).padStart(2, "0");
              return (
                <option key={i} value={`${h}:00`}>
                  {`${h}:00`}
                </option>
              );
            })}
          </select>
          <span>〜</span>
          <select
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="cute-select"
          >
            {Array.from({ length: 24 }).map((_, i) => {
              const h = String(i).padStart(2, "0");
              return (
                <option key={i} value={`${h}:00`}>
                  {`${h}:00`}
                </option>
              );
            })}
          </select>
        </div>
      )}

      <button className="register-btn" onClick={handleRegister}>
        登録する
      </button>
    </div>
  );
};

export default PersonalPage;
