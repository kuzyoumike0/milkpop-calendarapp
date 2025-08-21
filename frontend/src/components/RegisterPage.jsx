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

  // 時刻指定の開始/終了
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

  // 登録 → 共有リンク発行
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
    <div className="min-h-screen bg-gray-100 text-gray-900 p-6">
      {/* バナー */}
      <header className="bg-[#004CA0] text-white p-4 text-2xl font-bold rounded-2xl shadow-md flex justify-between items-center">
        <span>MilkPOP Calendar</span>
        <nav className="space-x-4 text-lg">
          <a href="/" className="hover:text-[#FDB9C8]">トップ</a>
          <a href="/personal" className="hover:text-[#FDB9C8]">個人スケジュール</a>
        </nav>
      </header>

      <h1 className="text-3xl font-bold my-8 text-center text-[#004CA0]">
        日程登録
      </h1>

      {/* タイトル */}
      <div className="max-w-xl mx-auto mb-8">
        <label className="block text-lg mb-2 font-semibold">タイトル</label>
        <input
          type="text"
          className="w-full p-3 rounded-lg border border-gray-400 text-gray-900 focus:ring-2 focus:ring-[#FDB9C8]"
          placeholder="例：打ち合わせ"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* カレンダー */}
      <div className="max-w-5xl mx-auto bg-white text-black rounded-2xl shadow-lg p-4 mb-10">
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
            className="p-5 bg-white border border-[#004CA0] rounded-2xl shadow-lg"
          >
            <p className="text-lg font-semibold text-[#004CA0]">
              {format(event.start, "yyyy/MM/dd HH:mm", { locale: ja })} -{" "}
              {format(event.end, "yyyy/MM/dd HH:mm", { locale: ja })}
            </p>

            {/* 時間帯プルダウン */}
            <div className="mt-3">
              <label className="mr-2 font-medium">時間帯：</label>
              <select
                value={event.option}
                onChange={(e) => handleOptionChange(event.id, e.target.value)}
                className="p-2 rounded border border-gray-400 text-gray-900"
              >
                <option value="終日">終日</option>
                <option value="昼">昼</option>
                <option value="夜">夜</option>
                <option value="時刻指定">時刻指定</option>
              </select>
            </div>

            {/* 時刻指定選択時 */}
            {event.option === "時刻指定" && (
              <div className="flex gap-6 mt-3">
                <div>
                  <label className="font-medium">開始</label>
                  <select
                    value={event.startTime || ""}
                    onChange={(e) =>
                      handleTimeChange(event.id, "startTime", e.target.value)
                    }
                    className="ml-2 p-1 border border-gray-400 rounded text-gray-900"
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
                    className="ml-2 p-1 border border-gray-400 rounded text-gray-900"
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
      <div className="text-center mt-10">
        <button
          onClick={handleSubmit}
          className="bg-[#FDB9C8] text-[#004CA0] px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:opacity-80 transition"
        >
          登録して共有リンク発行
        </button>
      </div>

      {/* 共有リンク */}
      {shareUrl && (
        <div className="text-center mt-8">
          <p className="mb-3 font-medium">✅ 共有リンクが発行されました：</p>
          <a
            href={shareUrl}
            className="text-[#004CA0] underline break-all text-lg font-semibold"
          >
            {shareUrl}
          </a>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
