// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import {
  Calendar,
  dateFnsLocalizer,
} from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import ja from "date-fns/locale/ja";
import "./RegisterPage.css"; // ← CSSでデザイン統一

import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { ja };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [shareUrl, setShareUrl] = useState("");

  const handleSelectSlot = ({ start, end }) => {
    setSelectedEvents((prev) => [
      ...prev,
      {
        id: Date.now(),
        start,
        end,
        option: "終日",
        startTime: null,
        endTime: null,
      },
    ]);
  };

  const handleOptionChange = (id, value) => {
    setSelectedEvents((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, option: value, startTime: null, endTime: null } : e
      )
    );
  };

  const handleTimeChange = (id, field, value) => {
    setSelectedEvents((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          let updated = { ...e, [field]: value };
          if (
            updated.startTime &&
            updated.endTime &&
            Number(updated.startTime) >= Number(updated.endTime)
          ) {
            updated.endTime = null;
          }
          return updated;
        }
        return e;
      })
    );
  };

  const handleSubmit = () => {
    if (!title || selectedEvents.length === 0) {
      alert("タイトルと日程を入力してください");
      return;
    }
    const url = `${window.location.origin}/share/${Date.now()}`;
    setShareUrl(url);
  };

  const hours = Array.from({ length: 24 }, (_, i) => (i + 1) % 24);

  return (
    <div className="register-page">
      {/* バナー */}
      <header className="banner">
        <span className="logo">🌸 MilkPOP Calendar</span>
        <nav className="nav">
          <a href="/" className="nav-link">トップ</a>
          <a href="/personal" className="nav-link">個人スケジュール</a>
        </nav>
      </header>

      <main className="main">
        <h1 className="title">日程登録</h1>

        {/* タイトル入力 */}
        <div className="form-group">
          <label className="form-label">タイトル</label>
          <input
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* カレンダー */}
        <div className="calendar-wrapper">
          <Calendar
            localizer={localizer}
            selectable
            onSelectSlot={handleSelectSlot}
            events={selectedEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            views={["month", "week", "day"]}
            popup
          />
        </div>

        {/* 選択した日程 */}
        <div className="event-list">
          {selectedEvents.map((event) => (
            <div key={event.id} className="event-card">
              <p>
                {format(event.start, "yyyy/MM/dd HH:mm", { locale: ja })} -{" "}
                {format(event.end, "yyyy/MM/dd HH:mm", { locale: ja })}
              </p>

              <select
                value={event.option}
                onChange={(e) => handleOptionChange(event.id, e.target.value)}
                className="form-select"
              >
                <option value="終日">終日</option>
                <option value="昼">昼</option>
                <option value="夜">夜</option>
                <option value="時刻指定">時刻指定</option>
              </select>

              {event.option === "時刻指定" && (
                <div className="time-select">
                  <div>
                    <label>開始</label>
                    <select
                      value={event.startTime || ""}
                      onChange={(e) =>
                        handleTimeChange(event.id, "startTime", e.target.value)
                      }
                      className="form-select"
                    >
                      <option value="">--</option>
                      {hours.map((h) => (
                        <option key={h} value={h}>
                          {h}時
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>終了</label>
                    <select
                      value={event.endTime || ""}
                      onChange={(e) =>
                        handleTimeChange(event.id, "endTime", e.target.value)
                      }
                      className="form-select"
                    >
                      <option value="">--</option>
                      {hours.map((h) => (
                        <option
                          key={h}
                          value={h}
                          disabled={
                            event.startTime && Number(h) <= Number(event.startTime)
                          }
                        >
                          {h}時
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 登録ボタン */}
        <div className="btn-center">
          <button onClick={handleSubmit} className="btn btn-pink">
            登録して共有リンク発行
          </button>
        </div>

        {/* 共有リンク表示 */}
        {shareUrl && (
          <div className="share-link">
            <p>共有リンクが発行されました：</p>
            <a href={shareUrl} className="share-url">
              {shareUrl}
            </a>
          </div>
        )}
      </main>
    </div>
  );
};

export default RegisterPage;
