import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import Holidays from "date-holidays";

// === 日本の祝日設定 ===
const hd = new Holidays("JP");

export default function LinkPage() {
  const { linkId } = useParams();
  const [schedules, setSchedules] = useState([]); // 登録済みスケジュール
  const [selectedDates, setSelectedDates] = useState([]); // カレンダーで選択した日付
  const [username, setUsername] = useState("");

  // === 共有スケジュール取得 ===
  useEffect(() => {
    axios
      .get(`/api/share/${linkId}`)
      .then((res) => {
        setSchedules(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("API error:", err);
        setSchedules([]); // エラー時も配列にする
      });
  }, [linkId]);

  // === 日付クリックで複数選択 ===
  const handleDateClick = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    if (selectedDates.includes(dateStr)) {
      setSelectedDates(selectedDates.filter((d) => d !== dateStr));
    } else {
      setSelectedDates([...selectedDates, dateStr]);
    }
  };

  // === カレンダータイルの表示（祝日は赤、選択済みは青） ===
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const dateStr = date.toISOString().split("T")[0];
      if (hd.isHoliday(date)) {
        return "text-red-500 font-bold"; // 祝日赤字
      }
      if (selectedDates.includes(dateStr)) {
        return "bg-blue-500 text-white rounded-full"; // 選択済み青
      }
    }
    return null;
  };

  // === 参加登録処理 ===
  const handleSubmit = async () => {
    if (!username || selectedDates.length === 0) {
      alert("名前と日付を入力してください。");
      return;
    }

    const selections = selectedDates.map((d) => ({
      date: d,
      timeslot: "全日",
      status: "◯",
    }));

    try {
      await axios.post(`/api/share/${linkId}`, { username, selections });
      alert("登録しました！");
      setSelectedDates([]);
    } catch (err) {
      console.error("Error saving selections:", err);
      alert("登録に失敗しました");
    }
  };

  return (
    <div className="p-4 text-white">
      <h1 className="text-2xl font-bold mb-4">共有スケジュール</h1>

      {/* カレンダー */}
      <Calendar
        onClickDay={handleDateClick}
        value={selectedDates.map((d) => new Date(d))}
        tileClassName={tileClassName}
      />

      {/* 入力欄 */}
      <div className="mt-4">
        <input
          type="text"
          placeholder="名前を入力"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 rounded text-black"
        />
        <button
          onClick={handleSubmit}
          className="ml-2 bg-green-600 px-4 py-2 rounded"
        >
          登録
        </button>
      </div>

      {/* 登録済みスケジュール一覧 */}
      <div className="mt-8 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold mb-4">登録済みスケジュール</h2>
        <ul className="space-y-2">
          {schedules.length > 0 ? (
            schedules.map((s, idx) => (
              <li key={idx} className="bg-gray-800 p-3 rounded-lg">
                <strong>{s.title}</strong> ({s.timeslot})<br />
                {s.date}
              </li>
            ))
          ) : (
            <li className="text-gray-400">スケジュールはまだありません。</li>
          )}
        </ul>
      </div>
    </div>
  );
}
