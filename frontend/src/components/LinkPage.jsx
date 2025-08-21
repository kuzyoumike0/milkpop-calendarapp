// frontend/src/components/LinkPage.jsx
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

const LinkPage = () => {
  const [title, setTitle] = useState("");
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [shareUrl, setShareUrl] = useState("");

  // カレンダー上で範囲選択
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

  // 時間帯変更
  const handleOptionChange = (id, value) => {
    setSelectedEvents((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, option: value, startTime: null, endTime: null } : e
      )
    );
  };

  // 時刻指定変更
  const handleTimeChange = (id, field, value) => {
    setSelectedEvents((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          let updated = { ...e, [field]: value };
          // 終了時刻が開始より前ならリセット
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

  // 登録処理（ダミーで共有リンクを作る）
  const handleSubmit = () => {
    if (!title || selectedEvents.length === 0) {
      alert("タイトルと日程を入力してください");
      return;
    }
    const url = `${window.location.origin}/share/${Date.now()}`;
    setShareUrl(url);
  };

  // 時刻プルダウン
  const hours = Array.from({ length: 24 }, (_, i) => (i + 1) % 24);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* バナー */}
      <header className="bg-[#FDB9C8] text-[#004CA0] p-4 text-2xl font-bold text-center rounded-2xl shadow-md flex justify-between">
        <span>MilkPOP Calendar</span>
        <nav className="space-x-4">
          <a href="/" className="hover:underline">トップ</a>
          <a href="/personal" className="hover:underline">個人スケジュール</a>
        </nav>
      </header>

      <h1 className="text-3xl font-bold my-6 text-center">日程登録</h1>

      {/* タイトル入力 */}
      <div className="max-w-xl mx-auto mb-6">
        <label className="block text-lg mb-2">タイトル</label>
        <input
          type="text"
          className="w-full p-2 rounded text-black"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* カレンダー */}
      <div className="max-w-4xl mx-auto h-[500px] bg-white rounded-lg mb-6">
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
      <div className="max-w-3xl mx-auto space-y-4">
        {selectedEvents.map((event) => (
          <div
            key={event.id}
            className="p-4 bg-[#004CA0] rounded-lg shadow-md text-white"
          >
            <p className="mb-2">
              {format(event.start, "yyyy/MM/dd HH:mm", { locale: ja })} -{" "}
              {format(event.end, "yyyy/MM/dd HH:mm", { locale: ja })}
            </p>

            {/* 時間帯プルダウン */}
            <select
              value={event.option}
              onChange={(e) => handleOptionChange(event.id, e.target.value)}
              className="p-2 text-black rounded"
            >
              <option value="終日">終日</option>
              <option value="昼">昼</option>
              <option value="夜">夜</option>
              <option value="時刻指定">時刻指定</option>
            </select>

            {/* 時刻指定の場合 */}
            {event.option === "時刻指定" && (
              <div className="flex gap-4 mt-2">
                <div>
                  <label>開始</label>
                  <select
                    value={event.startTime || ""}
                    onChange={(e) =>
                      handleTimeChange(event.id, "startTime", e.target.value)
                    }
                    className="ml-2 p-1 text-black rounded"
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
                    className="ml-2 p-1 text-black rounded"
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
      <div className="text-center mt-6">
        <button
          onClick={handleSubmit}
          className="bg-[#FDB9C8] text-[#004CA0] px-6 py-2 rounded-full font-bold shadow hover:opacity-80"
        >
          登録して共有リンク発行
        </button>
      </div>

      {/* 共有リンク表示 */}
      {shareUrl && (
        <div className="text-center mt-6">
          <p className="mb-2">共有リンクが発行されました：</p>
          <a
            href={shareUrl}
            className="text-[#FDB9C8] underline break-all"
          >
            {shareUrl}
          </a>
        </div>
      )}
    </div>
  );
};

export default LinkPage;
