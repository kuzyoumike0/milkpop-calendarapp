import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function SharePage({ linkId }) {
  const [schedules, setSchedules] = useState([]);
  const [username, setUsername] = useState("");
  const [responses, setResponses] = useState({});
  const [rangeMode, setRangeMode] = useState("範囲選択");
  const [selectedDates, setSelectedDates] = useState([]);

  // 共有スケジュール取得
  useEffect(() => {
    if (!linkId) return;
    axios.get(`/api/shared/${linkId}`).then((res) => setSchedules(res.data));
  }, [linkId]);

  // 日付選択処理
  const handleDateChange = (value) => {
    if (rangeMode === "範囲選択") {
      if (Array.isArray(value)) {
        const [start, end] = value;
        let temp = [];
        let cur = new Date(start);
        while (cur <= end) {
          temp.push(new Date(cur));
          cur.setDate(cur.getDate() + 1);
        }
        setSelectedDates(temp);
      }
    } else if (rangeMode === "複数選択") {
      setSelectedDates((prev) =>
        prev.find((d) => d.toDateString() === value.toDateString())
          ? prev.filter((d) => d.toDateString() !== value.toDateString())
          : [...prev, value]
      );
    }
  };

  // 回答保存
  const handleSave = async (scheduleId) => {
    try {
      await axios.post("/api/shared/responses", {
        scheduleId,
        username,
        response: responses[scheduleId] || "✖",
      });

      // 即更新
      const res = await axios.get(`/api/shared/${linkId}`);
      setSchedules(res.data);
    } catch (err) {
      alert("保存に失敗しました");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <header className="text-center text-3xl font-bold text-[#FDB9C8] mb-6">
        MilkPOP Calendar - 共有日程
      </header>

      <div className="max-w-4xl mx-auto bg-[#004CA0] p-6 rounded-2xl shadow-lg space-y-6">
        {/* ユーザー名 */}
        <input
          type="text"
          placeholder="あなたの名前"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 rounded-xl text-black"
        />

        {/* モード切替 */}
        <div className="flex space-x-4">
          <label>
            <input
              type="radio"
              value="範囲選択"
              checked={rangeMode === "範囲選択"}
              onChange={(e) => setRangeMode(e.target.value)}
            />
            範囲選択
          </label>
          <label>
            <input
              type="radio"
              value="複数選択"
              checked={rangeMode === "複数選択"}
              onChange={(e) => setRangeMode(e.target.value)}
            />
            複数選択
          </label>
        </div>

        {/* カレンダー */}
        <div className="bg-white rounded-xl p-4">
          <Calendar
            selectRange={rangeMode === "範囲選択"}
            onChange={handleDateChange}
          />
        </div>

        {/* 登録済みスケジュール表示 */}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-800">
              <th className="p-2">日付</th>
              <th className="p-2">時間帯</th>
              <th className="p-2">あなたの回答</th>
              <th className="p-2">保存</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s) => (
              <tr key={s.id} className="border-t border-gray-700">
                <td className="p-2">{s.date}</td>
                <td className="p-2">
                  {s.timeslot === "時間指定"
                    ? `${s.start_time}〜${s.end_time}`
                    : s.timeslot}
                </td>
                <td className="p-2">
                  <select
                    value={responses[s.id] || ""}
                    onChange={(e) =>
                      setResponses({ ...responses, [s.id]: e.target.value })
                    }
                    className="p-2 text-black rounded-lg"
                  >
                    <option value="">選択</option>
                    <option value="〇">〇</option>
                    <option value="✖">✖</option>
                  </select>
                </td>
                <td className="p-2">
                  <button
                    onClick={() => handleSave(s.id)}
                    className="px-3 py-1 bg-[#FDB9C8] text-black rounded-lg"
                  >
                    保存
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
