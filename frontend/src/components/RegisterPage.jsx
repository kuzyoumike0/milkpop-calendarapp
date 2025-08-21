// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/ja";
import "../index.css";

const localizer = momentLocalizer(moment);

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [events, setEvents] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [shareUrl, setShareUrl] = useState("");

  // 時間帯選択
  const [timeRange, setTimeRange] = useState("allday");

  // 祝日データ（例：一部）
  const holidays = {
    "2025-01-01": "元日",
    "2025-02-11": "建国記念の日",
    "2025-02-23": "天皇誕生日",
    "2025-04-29": "昭和の日",
    "2025-05-03": "憲法記念日",
    "2025-05-04": "みどりの日",
    "2025-05-05": "こどもの日",
  };

  // カレンダー選択処理
  const handleSelectSlot = ({ start, end }) => {
    const range = { start, end };
    setSelectedSlots((prev) => [...prev, range]);
  };

  // イベント保存
  const handleAddEvent = () => {
    if (!title || selectedSlots.length === 0) return;

    const newEvents = selectedSlots.map((slot) => ({
      title: `${title} (${formatTimeRange(timeRange, slot.start, slot.end)})`,
      start: slot.start,
      end: slot.end,
      allDay: timeRange === "allday",
    }));

    setEvents((prev) => [...prev, ...newEvents]);
    setSelectedSlots([]);
    setTitle("");

    // 共有リンクを仮生成
    setShareUrl(`${window.location.origin}/share/${Date.now()}`);
  };

  // 時間帯を文字に
  const formatTimeRange = (range, start, end) => {
    switch (range) {
      case "allday":
        return "終日";
      case "day":
        return "昼";
      case "night":
        return "夜";
      case "custom":
        return `${moment(start).format("HH:mm")} - ${moment(end).format(
          "HH:mm"
        )}`;
      default:
        return "";
    }
  };

  // カレンダーセルに祝日情報を付与
  const dayPropGetter = (date) => {
    const dateStr = moment(date).format("YYYY-MM-DD");
    if (holidays[dateStr]) {
      return {
        className: "holiday",
        "data-holiday": holidays[dateStr],
      };
    }
    return {};
  };

  return (
    <div className="page-card">
      <h2 style={{ color: "#FDB9C8", marginBottom: "1rem" }}>
        日程登録ページ
      </h2>

      {/* タイトル入力 */}
      <div className="form-group">
        <label>タイトル</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="イベントタイトルを入力"
        />
      </div>

      {/* 時間帯選択 */}
      <div className="form-group">
        <label>時間帯</label>
        <div>
          <label>
            <input
              type="radio"
              value="allday"
              checked={timeRange === "allday"}
              onChange={(e) => setTimeRange(e.target.value)}
            />
            終日
          </label>
          <label style={{ marginLeft: "1rem" }}>
            <input
              type="radio"
              value="day"
              checked={timeRange === "day"}
              onChange={(e) => setTimeRange(e.target.value)}
            />
            昼
          </label>
          <label style={{ marginLeft: "1rem" }}>
            <input
              type="radio"
              value="night"
              checked={timeRange === "night"}
              onChange={(e) => setTimeRange(e.target.value)}
            />
            夜
          </label>
          <label style={{ marginLeft: "1rem" }}>
            <input
              type="radio"
              value="custom"
              checked={timeRange === "custom"}
              onChange={(e) => setTimeRange(e.target.value)}
            />
            時間指定
          </label>
        </div>
      </div>

      {/* カレンダー */}
      <div style={{ height: "500px", marginBottom: "1rem" }}>
        <Calendar
          localizer={localizer}
          events={events}
          selectable
          onSelectSlot={handleSelectSlot}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          dayPropGetter={dayPropGetter}
          views={["month"]}
        />
      </div>

      {/* 登録ボタン */}
      <button onClick={handleAddEvent}>日程を登録</button>

      {/* 登録済みリスト */}
      <div style={{ marginTop: "2rem" }}>
        <h3 style={{ color: "#FDB9C8" }}>登録済み日程</h3>
        <ul>
          {events.map((ev, idx) => (
            <li key={idx}>
              {ev.title}{" "}
              ({moment(ev.start).format("MM/DD")} -{" "}
              {moment(ev.end).format("MM/DD")})
            </li>
          ))}
        </ul>
      </div>

      {/* 共有リンク */}
      {shareUrl && (
        <div style={{ marginTop: "1.5rem" }}>
          <h3 style={{ color: "#FDB9C8" }}>共有リンク</h3>
          <a href={shareUrl} target="_blank" rel="noopener noreferrer">
            {shareUrl}
          </a>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
