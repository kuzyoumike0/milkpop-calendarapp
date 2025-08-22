// frontend/src/components/PersonalPage.jsx
import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../index.css";

const PersonalPage = () => {
  const [mode, setMode] = useState("range"); // range | multi
  const [range, setRange] = useState([null, null]);
  const [multiDates, setMultiDates] = useState([]);
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [time, setTime] = useState("終日");

  // ===== 複数日クリック用 =====
  const handleMultiClick = (date) => {
    const dateStr = date.toDateString();
    if (multiDates.some((d) => d.toDateString() === dateStr)) {
      setMultiDates(multiDates.filter((d) => d.toDateString() !== dateStr));
    } else {
      setMultiDates([...multiDates, date]);
    }
  };

  // ===== 登録 =====
  const handleAddEvent = () => {
    if (!title) return;

    let datesInfo = [];
    if (mode === "range") {
      if (!range[0] || !range[1]) return alert("範囲を選択してください！");
      datesInfo = [
        `${range[0].toDateString()} 〜 ${range[1].toDateString()}`
      ];
    } else {
      if (multiDates.length === 0) return alert("日付を選択してください！");
      datesInfo = multiDates.map((d) => d.toDateString());
    }

    const newEvent = {
      id: Date.now(),
      title,
      memo,
      time,
      dates: datesInfo
    };

    setEvents([...events, newEvent]);
    setTitle("");
    setMemo("");
    setTime("終日");
    setRange([null, null]);
    setMultiDates([]);
  };

  return (
    <div className="page-container">
      {/* 共通ヘッダー */}
      {/* <Header /> を呼ぶようにしてください */}

      <div className="register-layout">
        {/* カレンダー */}
        <div className="calendar-section">
          {/* ラジオボタン切り替え */}
          <div className="mode-select">
            <label>
              <input
                type="radio"
                value="range"
                checked={mode === "range"}
                onChange={(e) => setMode(e.target.value)}
              />
              範囲選択
            </label>
            <label>
              <input
                type="radio"
                value="multi"
                checked={mode === "multi"}
                onChange={(e) => setMode(e.target.value)}
              />
              複数選択
            </label>
          </div>

          {mode === "range" ? (
            <Calendar
              selectRange={true}
              onChange={setRange}
              value={range}
              tileClassName={({ date }) =>
                range[0] && range[1] && date >= range[0] && date <= range[1]
                  ? "selected-date"
                  : ""
              }
            />
          ) : (
            <Calendar
              onClickDay={handleMultiClick}
              value={multiDates}
              tileClassName={({ date }) =>
                multiDates.some((d) => d.toDateString() === date.toDateString())
                  ? "selected-date"
                  : ""
              }
            />
          )}
        </div>

        {/* 右側リスト */}
        <div className="event-list">
          <h2 className="section-title">スケジュール登録</h2>
          <input
            type="text"
            placeholder="タイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-box"
          />
          <textarea
            placeholder="メモ"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="input-box"
          />
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="input-box"
          >
            <option value="終日">終日</option>
            <option value="昼">昼</option>
            <option value="夜">夜</option>
            <option value="時間指定">時間指定</option>
          </select>
          <button onClick={handleAddEvent} className="add-btn">
            ➕ 登録
          </button>

          <h2 className="section-title">登録済みスケジュール</h2>
          <ul>
            {events.map((ev) => (
              <li key={ev.id} className="event-item">
                <strong>{ev.title}</strong> ({ev.time})
                <br />
                {ev.dates.join(", ")}
                {ev.memo && <p className="memo">{ev.memo}</p>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PersonalPage;
