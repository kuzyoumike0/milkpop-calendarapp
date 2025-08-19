import React, { useState, useEffect } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function ShareLinkPage({ linkId }) {
  const [username, setUsername] = useState("");
  const [timeslot, setTimeslot] = useState("終日");
  const [comment, setComment] = useState("");
  const [schedules, setSchedules] = useState([]);

  // カレンダー選択モード
  const [selectMode, setSelectMode] = useState("single"); // single | range | multiple
  const [calendarValue, setCalendarValue] = useState(new Date()); // 状態はモードに応じて変わる

  // 日付フォーマット
  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // 予定一覧取得
  const fetchSchedules = async () => {
    try {
      const res = await axios.get(`/api/shared/${linkId}`);
      setSchedules(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch schedules:", err);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [linkId]);

  // 登録処理
  const handleRegister = async () => {
    if (!username.trim()) {
      alert("名前を入力してください");
      return;
    }

    // モードごとに登録する日付リストを作る
    let dates = [];
    if (selectMode === "single") {
      dates = [calendarValue];
    } else if (selectMode === "range" && Array.isArray(calendarValue)) {
      const [start, end] = calendarValue;
      if (start && end) {
        let cur = new Date(start);
        while (cur <= end) {
          dates.push(new Date(cur));
          cur.setDate(cur.getDate() + 1);
        }
      }
    } else if (selectMode === "multiple" && Array.isArray(calendarValue)) {
      dates = calendarValue;
    }

    try {
      for (const d of dates) {
        await axios.post(`/api/share/${linkId}`, {
          username,
          date: formatDate(d),
          timeslot,
          comment,
        });
      }
      alert("✅ 予定を登録しました");
      setComment("");
      fetchSchedules();
    } catch (err) {
      alert(err.response?.data?.error || "登録失敗");
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">共有スケジュール</h2>

      {/* 選択モード切り替え */}
      <div className="mb-4 space-x-4">
        <label>
          <input
            type="radio"
            name="mode"
            value="single"
            checked={selectMode === "single"}
            onChange={() => setSelectMode("single")}
          />{" "}
          単日
        </label>
        <label>
          <input
            type="radio"
            name="mode"
            value="range"
            checked={selectMode === "range"}
            onChange={() => {
              setSelectMode("range");
              setCalendarValue([new Date(), new Date()]);
            }}
          />{" "}
          範囲選択
        </label>
        <label>
          <input
            type="radio"
            name="mode"
            value="multiple"
            checked={selectMode === "multiple"}
            onChange={() => {
              setSelectMode("multiple");
              setCalendarValue([new Date()]);
            }}
          />{" "}
          複数選択
        </label>
      </div>

      {/* カレンダー UI */}
      <Calendar
        onChange={setCalendarValue}
        value={calendarValue}
        selectRange={selectMode === "range"}
        allowMultiple={selectMode === "multiple"} // react-calendar で拡張: v5以降はmultiple対応
      />

      {/* 入力フォーム */}
      <div className="mt-4 space-y-2 border p-4 rounded shadow">
        <input
          type="text"
          placeholder="名前"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <select
          value={timeslot}
          onChange={(e) => setTimeslot(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option>終日</option>
          <option>昼</option>
          <option>夜</option>
        </select>
        <input
          type="text"
          placeholder="コメント（任意）"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <button
          onClick={handleRegister}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          登録
        </button>
      </div>

      {/* 既存スケジュール表示 */}
      <div className="mt-6">
        {schedules.length === 0 ? (
          <p className="text-gray-500">まだ予定がありません</p>
        ) : (
          <ul className="list-disc pl-6">
            {schedules.map((s) => (
              <li key={s.id}>
                {s.date} - {s.username} ({s.timeslot}) : {s.comment || "-"}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
