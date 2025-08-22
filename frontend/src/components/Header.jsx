import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../index.css";

const RegisterPage = () => {
  const [mode, setMode] = useState("range"); // range | multi
  const [range, setRange] = useState([null, null]);
  const [multiDates, setMultiDates] = useState([]);
  const [title, setTitle] = useState("");

  // ===== 日付クリック処理（multi用） =====
  const handleMultiClick = (date) => {
    const dateStr = date.toDateString();
    if (multiDates.some((d) => d.toDateString() === dateStr)) {
      setMultiDates(multiDates.filter((d) => d.toDateString() !== dateStr));
    } else {
      setMultiDates([...multiDates, date]);
    }
  };

  // ===== 登録 =====
  const handleAdd = () => {
    if (!title) return;

    let datesInfo = "";
    if (mode === "range") {
      if (!range[0] || !range[1]) return alert("範囲を選択してください！");
      datesInfo = `${range[0].toDateString()} 〜 ${range[1].toDateString()}`;
    } else {
      if (multiDates.length === 0) return alert("日付を選択してください！");
      datesInfo = multiDates.map((d) => d.toDateString()).join(", ");
    }

    alert(`登録しました！\nタイトル: ${title}\n日程: ${datesInfo}`);
    setTitle("");
    setRange([null, null]);
    setMultiDates([]);
  };

  return (
    <div className="page-container">
      {/* バナーは共通 Header.jsx を読み込む */}
      
      <div className="register-layout">
        {/* カレンダー */}
        <div className="calendar-section">
          {/* ラジオボタン */}
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

        {/* 右側入力フォーム */}
        <div className="event-list">
          <h2 className="section-title">スケジュール登録</h2>
          <input
            type="text"
            placeholder="タイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-box"
          />
          <button onClick={handleAdd} className="add-btn">
            ➕ 登録
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
