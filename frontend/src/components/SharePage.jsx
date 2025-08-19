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
        setEvents(res.data);
      } catch (err) {
        console.error("予定取得に失敗:", err);
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
      setEvents(res.data);
    } catch (err) {
      console.error("予定登録に失敗:", err);
      alert("予定登録に失敗しました");
    }
  };

  // 共有リンク発行
  const handleCreateShareLink = async () => {
    try {
      const res = await axios.post("/api/share", {});
      setLinkId(res.data.linkId);
    } catch (err) {
      console.error("共有リンク作成に失敗:", err);
      alert("共有リンクの作成に失敗しました");
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">日程共有ページ</h2>

      {/* カレンダー */}
      <Calendar value={date} onChange={setDate} />

      {/* 入力フォーム */}
      <div className="mt-4 space-y-2">
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

      {/* 共有リンク発行 */}
      <div className="mt-6">
        <button
          onClick={handleCreateShareLink}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          共有リンク発行
        </button>
        {linkId && (
          <div className="mt-2">
            <span className="font-mono">{`${window.location.origin}/share/${linkId}`}</span>
          </div>
        )}
      </div>

      {/* 登録済み予定一覧 */}
      <div className="mt-6">
        <h3 className="font-semibold mb-2">登録済み予定</h3>
        <ul className="list-disc pl-6">
          {events.map((e) => (
            <li key={e.id}>
              {e.username} - {e.timeslot}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
