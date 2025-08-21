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

  // カレンダーで範囲選択
  const handleSelectSlot = ({ start, end }) => {
    setSelectedEvents((prev) => [
      ...prev,
      {
        id: Date.now(),
        start,
        end,
        option: "終日", // デフォルト
        startTime: null,
        endTime: null,
      },
    ]);
  };

  // 時間帯（終日・昼・夜・時刻指定）
  const handleOptionChange = (id, value) => {
    setSelectedEvents((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, option: value, startTime: null, endTime: null } : e
      )
    );
  };

  // 時刻選択
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

  // 登録処理（共有リンク発行）
  const handleSubmit = () => {
    if (!title || selectedEvents.length === 0) {
      alert("タイトルと日程を入力してください");
      return;
    }
    const url = `${window.location.origin}/share/${Date.now()}`;
    setShareUrl(url);
  };

  // 時刻プルダウン用（1時～0時）
  const hours = Array.from({ length: 24 }, (_, i) => (i + 1) % 24);

  return (
    <div className="page-container">
      {/* バナー */}
      <header className="banner">
        <h1>MilkPOP Calendar</h1>
        <nav>
          <a href="/">トップ</a>
          <a href="/personal">個人スケジュール</a>
        </nav>
      </header>

      <main className="main-content">
        <h2>日程登録</h2>

        {/* タイトル入力 */}
        <div className="form-group">
          <label>タイトル</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* カレンダー */}
        <div className="calendar-box">
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
            <div key={event.id} className="event-item">
              <p>
                {format(event.start, "yyyy/MM/dd HH:mm", { locale: ja })} -{" "}
                {format(event.end, "yyyy/MM/dd HH:mm", { locale: ja })}
              </p>

              {/* 時間帯 */}
              <select
                value={event.option}
                onChange={(e) => handleOptionChange(event.id, e.target.value)}
              >
                <option value="終日">終日</option>
                <option value="昼">昼</option>
                <option value="夜">夜</option>
                <option value="時刻指定">時刻指定</option>
              </select>

              {/* 時刻指定の場合 */}
              {event.option === "時刻指定" && (
                <div className="time-select">
                  <label>開始</label>
                  <select
                    value={event.startTime || ""}
                    onChange={(e) =>
                      handleTimeChange(event.id, "startTime", e.target.value)
                    }
                  >
                    <option value="">--</option>
                    {hours.map((h) => (
                      <option key={h} value={h}>
                        {h}時
                      </option>
                    ))}
                  </select>

                  <label>終了</label>
                  <select
                    value={event.endTime || ""}
                    onChange={(e) =>
                      handleTimeChange(event.id, "endTime", e.target.value)
                    }
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
              )}
            </div>
          ))}
        </div>

        {/* 登録ボタン */}
        <div className="button-area">
          <button onClick={handleSubmit}>登録して共有リンク発行</button>
        </div>

        {/* 共有リンク */}
        {shareUrl && (
          <div className="share-link">
            <p>共有リンクが発行されました：</p>
            <a href={shareUrl}>{shareUrl}</a>
          </div>
        )}
      </main>
    </div>
  );
};

export default RegisterPage;
