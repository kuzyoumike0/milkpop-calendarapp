import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useHolidays } from "../hooks/useHolidays";

export default function SharePage() {
  const { linkid } = useParams();
  const [schedule, setSchedule] = useState([]);
  const [username, setUsername] = useState("");
  const [selections, setSelections] = useState([]);
  const holidays = useHolidays();

  // 共有スケジュール取得
  useEffect(() => {
    axios
      .get(`/api/share/${linkid}`)
      .then((res) => setSchedule(res.data))
      .catch((err) => console.error("取得エラー:", err));
  }, [linkid]);

  // 日付クリック
  const toggleSelection = (date, timeslot) => {
    const iso = date.toISOString().split("T")[0];
    const key = `${iso}-${timeslot}`;

    if (selections.find((s) => s.key === key)) {
      setSelections(selections.filter((s) => s.key !== key));
    } else {
      setSelections([...selections, { key, date: iso, timeslot, status: "⭕" }]);
    }
  };

  // 登録処理
  const handleSubmit = async () => {
    if (!username) {
      alert("ユーザー名を入力してください");
      return;
    }
    try {
      await axios.post(`/api/share/${linkid}`, {
        username,
        selections,
      });
      alert("参加情報を登録しました！");
    } catch (err) {
      console.error("登録エラー:", err);
      alert("登録に失敗しました。");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">共有スケジュール</h1>

      {/* ユーザー名入力 */}
      <input
        className="w-full p-2 mb-4 bg-gray-800 rounded"
        placeholder="あなたの名前を入力"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      {/* カレンダー（祝日赤字 & 選択反映） */}
      <Calendar
        onClickDay={(d) => toggleSelection(d, "全日")}
        tileClassName={({ date }) => {
          const iso = date.toISOString().split("T")[0];
          if (selections.some((s) => s.date === iso)) {
            return "bg-blue-600 text-white rounded-full";
          }
          if (holidays.includes(iso)) {
            return "text-red-500 font-bold";
          }
          return "";
        }}
        locale="ja-JP"
      />

      {/* 登録ボタン */}
      <button
        onClick={handleSubmit}
        className="mt-6 w-full py-3 bg-green-600 rounded-lg hover:bg-green-500"
      >
        登録する
      </button>

      {/* 選択済み表示 */}
      <div className="mt-8 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold mb-4">あなたの選択</h2>
        <ul className="space-y-2">
          {selections.map((s, idx) => (
            <li key={idx} className="bg-gray-800 p-3 rounded-lg">
              {s.date} ({s.timeslot}) → {s.status}
            </li>
          ))}
        </ul>
      </div>

      {/* 共有スケジュール一覧 */}
      <div className="mt-10 max-w-4xl mx-auto">
        <h2 className="text-xl font-bold mb-4">全体のスケジュール</h2>
        <ul className="space-y-2">
          {schedule.map((s, idx) => (
            <li key={idx} className="bg-gray-700 p-3 rounded-lg">
              <strong>{s.title}</strong> ({s.timeslot})<br />
              {s.date}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
