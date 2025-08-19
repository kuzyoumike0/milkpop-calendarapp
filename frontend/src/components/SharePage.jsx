import React, { useState, useEffect } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function SharePage() {
  const [date, setDate] = useState(new Date());
  const [username, setUsername] = useState("");
  const [timeSlot, setTimeSlot] = useState("全日");
  const [events, setEvents] = useState([]);
  const [linkId, setLinkId] = useState(null);

  // 日付フォーマット
  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // イベント取得
  useEffect(() => {
    const fetchEvents = async () => {
      const formattedDate = formatDate(date);
      try {
        const res = await axios.get(`/api/shared?date=${formattedDate}`);
        console.log("✅ /api/shared response:", res.data);
        // ✅ 常に配列で state に入れる
        setEvents(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("❌ 予定取得に失敗:", err);
        setEvents([]); // mapエラー防止
      }
    };
    fetchEvents();
  }, [date]);

  // 日程登録
  const handleRegister = async () => {
    if (!username.trim()) {
      alert("名前を入力してください");
      return;
    }
    try {
      await axios.post("/api/personal", {
        username,
        date: formatDate(date),
        timeslot: timeSlot,
      });
      alert("予定を登録しました");
      setUsername("");
      setTimeSlot("全日");
      const res = await axios.get(`/api/shared?date=${formatDate(date)}`);
      setEvents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("❌ 予定登録に失敗:", err);
      alert("予定登録に失敗しました");
    }
  };

  // 共有リンク発行
  const handleCreateShareLink = async () => {
    try {
      const res = await axios.post("/api/share", {});
      setLinkId(res.data.linkId);
    } catch (err) {
      console.error("❌ 共有リンク作成に失敗:", err);
      alert("共有リンクの作成に失敗しました");
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">共有スケジュール</h2>

      {/* カレンダー */}
      <Calendar value={date} onChange={setDate} className="mb-4" />

      {/* 入力フォーム */}
      <div className="space-y-2 border p-4 rounded shadow">
        <input
          type="text"
          placeholder="名前"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <select
          value={timeSlot}
          onChange={(e) => setTimeSlot(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option>全日</option>
          <option>昼</option>
          <option>夜</option>
        </select>
        <button
          onClick={handleRegister}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          登録
        </button>
      </div>

      {/* イベント表示 */}
      <div className="mt-6">
        <h3 className="font-semibold">予定一覧</h3>
        <ul className="list-disc pl-5 space-y-1">
          {Array.isArray(events) &&
            events.map((event) => (
              <li key={event.id}>
                {event.username} - {event.date} - {event.timeslot}
              </li>
            ))}
        </ul>
      </div>

      {/* 共有リンク発行 */}
      <div className="mt-6">
        <button
          onClick={handleCreateShareLink}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          共有リンクを発行
        </button>
        {linkId && (
          <p className="mt-2 break-words">
            共有リンク: {window.location.origin}/share/{linkId}
          </p>
        )}
      </div>
    </div>
  );
}
