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

  // カレンダー範囲/複数選択
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

  // 時間帯変更
  const handleOptionChange = (id, value) => {
    setSelectedEvents((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, option: value, startTime: null, endTime: null } : e
      )
    );
  };

  // 時刻指定
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

  // 登録処理
  const handleSubmit = () => {
    if (!title || selectedEvents.length === 0) {
      alert("タイトルと日程を入力してください");
      return;
    }
    const url = `${window.location.origin}/share/${Date.now()}`;
    setShareUrl(url);
  };

  // 1〜24時
  const hours = Array.from({ length: 24 }, (_, i) => (i + 1) % 24 || 24);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0a1f44] to-[#004CA0] text-white p-6">
      {/* バナー */}
      <header className="bg-[#FDB9C8] text-[#004CA0] p-4 text-2xl font-bold rounded-2xl shadow-lg flex justify-between items-center">
        <span>🌸 MilkPOP Calendar</span>
        <nav className="space-x-6 text-lg">
          <a href="/" className="hover:underline">トップ</a>
          <a href="/personal" className="hover:underline">個人スケジュール</a>
        </nav>
      </header>

      <h1 className="text-4xl font-extrabold my-10 text-center text-[#FDB9C8] drop-shadow-lg">
        日程登録
      </h1>

      {/* タイトル入力 */}
      <div className="max-w-xl mx-auto mb-10">
        <label className="block text-lg mb-3 font-semibold">タイトル</label>
        <input
          type="text"
          className="w-full p-4 rounded-xl border border-gray-300 text-gray-900 focus:ring-4 focus:ring-[#FDB9C8] focus:outline-none shadow-md"
          placeholder="例：春のミーティング"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* カレンダー */}
      <div className="max-w-5xl mx-auto bg-white text-black rounded-3xl shadow-2xl p-6 mb-12">
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

      {/* 選択済み日程 */}
      <div className="max-w-3xl mx-auto space-y-6">
        {selectedEvents.map((event) => (
          <div
            key={event.id}
            className="p-6 bg-white border-l-8 border-[#FDB9C8] rounded-2xl shadow-lg text-gray-900"
          >
            <p className="text-lg font-bold text-[#004CA0] mb-3">
              {format(event.start, "yyyy/MM/dd HH:mm", { locale: ja })} -{" "}
              {format(event.end, "yyyy/MM/dd HH:mm", { locale: ja })}
            </p>

            {/* 時間帯プルダウン */}
            <div className="mt-2">
              <label className="mr-3 font-medium">時間帯：</label>
              <select
                value={event.option}
                onChange={(e) => handleOptionChange(event.id, e.target.value)}
                className="p-2 rounded-lg border border-gray-400 text-gray-900 focus:ring-2 focus:ring-[#004CA0]"
              >
                <option value="終日">終日</option>
                <option value="昼">昼</option>
                <option value="夜">夜</option>
                <option value="時刻指定">時刻指定</option>
              </select>
            </div>

            {/* 時刻指定 */}
            {event.option === "時刻指定" && (
              <div className="flex gap-8 mt-4">
                <div>
                  <label className="font-medium">開始</label>
                  <select
                    value={event.startTime || ""}
                    onChange={(e) =>
                      handleTimeChange(event.id, "startTime", e.target.value)
                    }
                    className="ml-2 p-2 rounded border border-gray-400 text-gray-900"
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
                  <label className="font-medium">終了</label>
                  <select
                    value={event.endTime || ""}
                    onChange={(e) =>
                      handleTimeChange(event.id, "endTime", e.target.value)
                    }
                    className="ml-2 p-2 rounded border border-gray-400 text-gray-900"
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
      <div className="text-center mt-12">
        <button
          onClick={handleSubmit}
          className="bg-gradient-to-r from-[#FDB9C8] to-[#ff80a9] text-[#004CA0] px-10 py-4 rounded-full font-bold text-xl shadow-xl hover:scale-105 transition transform"
        >
          登録して共有リンク発行
        </button>
      </div>

      {/* 共有リンク */}
      {shareUrl && (
        <div className="text-center mt-10 bg-white text-[#004CA0] p-6 rounded-2xl shadow-lg max-w-2xl mx-auto">
          <p className="mb-3 font-semibold">✅ 共有リンクが発行されました：</p>
          <a
            href={shareUrl}
            className="text-[#FDB9C8] underline break-all text-lg font-bold"
          >
            {shareUrl}
          </a>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
