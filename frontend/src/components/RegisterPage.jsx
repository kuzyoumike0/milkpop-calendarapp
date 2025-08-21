// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../index.css";

const localizer = momentLocalizer(moment);

const RegisterPage = () => {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [link, setLink] = useState(null);

  const handleSelectSlot = ({ start, end }) => {
    const newEvent = {
      id: Date.now(),
      title: title || "未設定",
      start,
      end,
      option: "終日", // 初期値
      startTime: "09:00",
      endTime: "18:00",
    };
    setEvents([...events, newEvent]);
  };

  const handleOptionChange = (id, value) => {
    setEvents(
      events.map((ev) =>
        ev.id === id ? { ...ev, option: value } : ev
      )
    );
  };

  const handleTimeChange = (id, field, value) => {
    setEvents(
      events.map((ev) =>
        ev.id === id ? { ...ev, [field]: value } : ev
      )
    );
  };

  const generateLink = () => {
    const uniqueId = Date.now().toString(36);
    const url = `${window.location.origin}/share/${uniqueId}`;
    setLink(url);
  };

  return (
    <div className="page-container">
      <h2 className="text-2xl font-bold text-center mb-4">
        日程登録ページ
      </h2>

      {/* タイトル入力 */}
      <div className="mb-4 text-center">
        <input
          type="text"
          placeholder="タイトルを入力"
          className="p-2 border rounded text-black w-80"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* カレンダー */}
      <div className="calendar-container mb-6">
        <Calendar
          localizer={localizer}
          selectable
          onSelectSlot={handleSelectSlot}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500, backgroundColor: "white", color: "black" }}
        />
      </div>

      {/* 選択された日程のリスト */}
      <div className="event-list mb-6">
        <h3 className="text-xl font-semibold mb-2">選択した日程</h3>
        {events.length === 0 && <p>まだ選択されていません。</p>}
        {events.map((ev) => (
          <div
            key={ev.id}
            className="p-3 mb-3 bg-gray-800 rounded-lg shadow-md"
          >
            <p className="mb-2">
              📅 {moment(ev.start).format("YYYY/MM/DD")} -{" "}
              {moment(ev.end).format("YYYY/MM/DD")}
            </p>
            <p className="mb-2">タイトル: {ev.title}</p>

            {/* 時間帯オプション */}
            <select
              className="p-2 rounded text-black mb-2"
              value={ev.option}
              onChange={(e) => handleOptionChange(ev.id, e.target.value)}
            >
              <option value="終日">終日</option>
              <option value="昼">昼</option>
              <option value="夜">夜</option>
              <option value="時刻指定">時刻指定</option>
            </select>

            {/* 時刻指定が選ばれた場合 */}
            {ev.option === "時刻指定" && (
              <div className="flex space-x-2 mt-2">
                <select
                  className="p-2 rounded text-black"
                  value={ev.startTime}
                  onChange={(e) =>
                    handleTimeChange(ev.id, "startTime", e.target.value)
                  }
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={`${i}:00`}>
                      {i}:00
                    </option>
                  ))}
                </select>
                <span>〜</span>
                <select
                  className="p-2 rounded text-black"
                  value={ev.endTime}
                  onChange={(e) =>
                    handleTimeChange(ev.id, "endTime", e.target.value)
                  }
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={`${i}:00`}>
                      {i}:00
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 共有リンク生成 */}
      <div className="text-center">
        <button
          onClick={generateLink}
          className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg shadow-lg"
        >
          共有リンクを発行
        </button>
        {link && (
          <p className="mt-3">
            発行されたリンク:{" "}
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-300"
            >
              {link}
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
