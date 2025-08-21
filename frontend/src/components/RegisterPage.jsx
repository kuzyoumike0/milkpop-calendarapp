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
    <div>
      {/* バナー */}
      <header className="banner">
        <span>MilkPOP Calendar</span>
        <nav>
          <a href="/" className="nav-link">トップ</a>
          <a href="/personal" className="nav-link">個人スケジュール</a>
        </nav>
      </header>

      <main style={{ padding: "40px" }}>
        <h1 style={{ textAlign: "center", fontSize: "28px", marginBottom: "20px" }}>
          日程登録
        </h1>

        {/* タイトル入力 */}
        <div className="card">
          <label style={{ display: "block", marginBottom: "8px" }}>タイトル</label>
          <input
            type="text"
            style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* カレンダー */}
        <div className="card" style={{ height: "500px" }}>
          <Calendar
            localizer={localizer}
            selectable
            onSelectSlot={handleSelectSlot}
            events={selectedEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            views={["month", "week", "day"]}
            popup
          />
        </div>

        {/* 選択した日程 */}
        <div>
          {selectedEvents.map((event) => (
            <div key={event.id} className="card">
              <p>
                {format(event.start, "yyyy/MM/dd HH:mm", { locale: ja })} -{" "}
                {format(event.end, "yyyy/MM/dd HH:mm", { locale: ja })}
              </p>

              {/* 時間帯プルダウン */}
              <select
                value={event.option}
                onChange={(e) => handleOptionChange(event.id, e.target.value)}
                style={{ padding: "6px", marginTop: "8px" }}
              >
                <option value="終日">終日</option>
                <option value="昼">昼</option>
                <option value="夜">夜</option>
                <option value="時刻指定">時刻指定</option>
              </select>

              {/* 時刻指定の場合 */}
              {event.option === "時刻指定" && (
                <div style={{ marginTop: "10px", display: "flex", gap: "12px" }}>
                  <div>
                    <label>開始</label>
                    <select
                      value={event.startTime || ""}
                      onChange={(e) => handleTimeChange(event.id, "startTime", e.target.value)}
                      style={{ marginLeft: "6px", padding: "4px" }}
                    >
                      <option value="">--</option>
                      {hours.map((h) => (
                        <option key={h} value={h}>{h}時</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>終了</label>
                    <select
                      value={event.endTime || ""}
                      onChange={(e) => handleTimeChange(event.id, "endTime", e.target.value)}
                      style={{ marginLeft: "6px", padding: "4px" }}
                    >
                      <option value="">--</option>
                      {hours.map((h) => (
                        <option
                          key={h}
                          value={h}
                          disabled={event.startTime && Number(h) <= Number(event.startTime)}
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
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button onClick={handleSubmit} className="btn btn-pink">
            登録して共有リンク発行
          </button>
        </div>

        {/* 共有リンク表示 */}
        {shareUrl && (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <p>共有リンクが発行されました：</p>
            <a href={shareUrl} style={{ color: "#004CA0", fontWeight: "bold" }}>
              {shareUrl}
            </a>
          </div>
        )}
      </main>
    </div>
  );
};

export default RegisterPage;
