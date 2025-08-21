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

  // 時間帯 & 時刻
  const [timeRange, setTimeRange] = useState("allday");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  // 祝日データ（例）
  const holidays = {
    "2025-01-01": "元日",
    "2025-02-11": "建国記念の日",
    "2025-02-23": "天皇誕生日",
    "2025-04-29": "昭和の日",
    "2025-05-03": "憲法記念日",
    "2025-05-04": "みどりの日",
    "2025-05-05": "こどもの日",
    "2025-08-11": "山の日",
  };

  // 範囲選択 & 複数選択
  const handleSelectSlot = ({ start, end }) => {
    const range = { start, end };
    setSelectedSlots((prev) => [...prev, range]);
  };

  // イベント保存
  const handleAddEvent = () => {
    if (!title || selectedSlots.length === 0) return;

    const newEvents = selectedSlots.map((slot) => {
      let start = slot.start;
      let end = slot.end;

      if (timeRange === "custom") {
        const dateStr = moment(start).format("YYYY-MM-DD");
        start = moment(`${dateStr} ${startTime}`, "YYYY-MM-DD HH:mm").toDate();
        end = moment(`${dateStr} ${endTime}`, "YYYY-MM-DD HH:mm").toDate();
      }

      return {
        title: `${title} (${formatTimeRange(timeRange, start, end)})`,
        start,
        end,
        allDay: timeRange === "allday",
      };
    });

    setEvents((prev) => [...prev, ...newEvents]);
    setSelectedSlots([]);
    setTitle("");
    setShareUrl(`${window.location.origin}/share/${Date.now()}`);
  };

  // 時間帯ラベル
  const formatTimeRange = (range, start, end) => {
    switch (range) {
      case "allday":
        return "終日";
      case "day":
        return "昼";
      case "night":
        return "夜";
      case "custom":
        return `${moment(start).format("HH:mm")} - ${moment(end).format("HH:mm")}`;
      default:
        return "";
    }
  };

  // 祝日強調
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

  // 時刻プルダウン（1時間刻み）
  const times = Array.from({ length: 24 }, (_, i) =>
    `${String(i).padStart(2, "0")}:00`
  );

  return (
    <div
      className="page-card"
      style={{
        background:
          "linear-gradient(135deg, rgba(253,185,200,0.15), rgba(0,76,160,0.15))",
      }}
    >
      <h2 style={{ color: "#FDB9C8", marginBottom: "1rem" }}>日程登録ページ</h2>

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

      {/* カレンダー */}
      <div style={{ height: "500px", marginBottom: "1rem" }}>
        <Calendar
          localizer={localizer}
          events={events}
          selectable="ignoreEvents"
          onSelectSlot={handleSelectSlot}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          dayPropGetter={dayPropGetter}
          views={["month"]}
        />
      </div>

      {/* 日付区分（プルダウン） */}
      <div className="form-group">
        <label>日付区分</label>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="allday">終日</option>
          <option value="day">昼</option>
          <option value="night">夜</option>
          <option value="custom">時間帯</option>
        </select>
      </div>

      {/* custom の場合のみ表示 */}
      {timeRange === "custom" && (
        <div
          className="form-group"
          style={{ display: "flex", gap: "1rem", alignItems: "center" }}
        >
          <div>
            <label>開始時刻</label>
            <select
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value);
                if (moment(e.target.value, "HH:mm").isSameOrAfter(moment(endTime, "HH:mm"))) {
                  // 終了時刻を自動的に1時間後にする
                  const idx = times.indexOf(e.target.value);
                  if (idx < times.length - 1) {
                    setEndTime(times[idx + 1]);
                  }
                }
              }}
            >
              {times.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>終了時刻</label>
            <select
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            >
              {times
                .filter((t) =>
                  moment(t, "HH:mm").isAfter(moment(startTime, "HH:mm"))
                )
                .map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
            </select>
          </div>
        </div>
      )}

      {/* 登録ボタン */}
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <button
          onClick={handleAddEvent}
          style={{
            fontSize: "1.2rem",
            padding: "0.8rem 2rem",
            borderRadius: "12px",
            background: "linear-gradient(90deg, #FDB9C8, #004CA0)",
            border: "none",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "0.3s",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
        >
          ＋ 日程を登録
        </button>
      </div>

      {/* 登録済みリスト */}
      <div style={{ marginTop: "2rem" }}>
        <h3 style={{ color: "#FDB9C8" }}>登録済み日程</h3>
        <ul>
          {events.map((ev, idx) => (
            <li key={idx}>
              {ev.title} ({moment(ev.start).format("MM/DD")} -{" "}
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
