// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import ja from "date-fns/locale/ja"; // 日本語ロケール
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../index.css";

const locales = {
  ja: ja,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [events, setEvents] = useState([]);
  const [timeRange, setTimeRange] = useState("all-day");

  const handleSelectSlot = ({ start, end }) => {
    const newEvent = {
      title: title || "新しい予定",
      start,
      end,
    };
    setEvents([...events, newEvent]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(
      `タイトル: ${title}\n日程: ${events
        .map((e) => format(e.start, "yyyy/MM/dd HH:mm"))
        .join(", ")}\n時間帯: ${timeRange}`
    );
  };

  return (
    <div className="register-page">
      <h2 className="page-title">📅 日程登録</h2>

      <form className="register-form" onSubmit={handleSubmit}>
        {/* タイトル入力 */}
        <div className="form-group">
          <label htmlFor="title">イベントタイトル</label>
          <input
            type="text"
            id="title"
            placeholder="例: 夏祭り企画"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* カレンダー */}
        <div className="form-group">
          <label>日程を選択（クリック＆ドラッグで範囲選択）</label>
          <div className="calendar-wrapper">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              selectable
              onSelectSlot={handleSelectSlot}
              style={{ height: 500, borderRadius: "12px" }}
              culture="ja"
              messages={{
                today: "今日",
                previous: "前へ",
                next: "次へ",
                month: "月",
                week: "週",
                day: "日",
                agenda: "予定",
              }}
            />
          </div>
        </div>

        {/* 時間帯選択 */}
        <div className="form-group">
          <label>時間帯</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="all-day">終日</option>
            <option value="day">昼</option>
            <option value="night">夜</option>
            <option value="custom">指定時間</option>
          </select>
        </div>

        {/* 登録ボタン */}
        <button type="submit" className="submit-btn">
          ✅ 登録する
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
