import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function SharePage() {
  const { linkid } = useParams();
  const [schedule, setSchedule] = useState([]);
  const [username, setUsername] = useState("");
  const [responses, setResponses] = useState({});
  const [rangeMode, setRangeMode] = useState("multiple");
  const [selectedDates, setSelectedDates] = useState([]);

  // === 日程取得 ===
  useEffect(() => {
    axios.get(`/api/share/${linkid}`).then((res) => {
      const sorted = res.data.sort((a, b) =>
        new Date(a.start_date) - new Date(b.start_date)
      );
      setSchedule(sorted);
    });
  }, [linkid]);

  // === カレンダークリック ===
  const handleDateClick = (value) => {
    if (rangeMode === "multiple") {
      if (selectedDates.some((d) => d.toDateString() === value.toDateString())) {
        setSelectedDates(selectedDates.filter((d) => d.toDateString() !== value.toDateString()));
      } else {
        setSelectedDates([...selectedDates, value]);
      }
    } else if (rangeMode === "range") {
      if (selectedDates.length === 0 || selectedDates.length === 2) {
        setSelectedDates([value]);
      } else if (selectedDates.length === 1) {
        const start = selectedDates[0];
        const end = value;
        const range = [];
        let current = new Date(start);
        while (current <= end) {
          range.push(new Date(current));
          current.setDate(current.getDate() + 1);
        }
        setSelectedDates(range);
      }
    }
  };

  // === 応答変更 ===
  const handleResponseChange = (id, value) => {
    setResponses({ ...responses, [id]: value });
  };

  // === 保存処理 ===
  const handleSave = async () => {
    if (!username) {
      alert("名前を入力してください");
      return;
    }

    try {
      for (const schedule_id of Object.keys(responses)) {
        await axios.post("/api/response", {
          username,
          schedule_id,
          response: responses[schedule_id],
        });
      }
      alert("保存しました");
    } catch (err) {
      console.error("保存失敗:", err);
      alert("保存に失敗しました");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">共有スケジュール</h2>

      {/* カレンダー */}
      <Calendar
        onClickDay={handleDateClick}
        value={selectedDates}
      />
      <div className="mt-2">
        {selectedDates.length > 0 ? (
          <p>
            選択した日付:{" "}
            {selectedDates.map((d) => d.toISOString().split("T")[0]).join(", ")}
          </p>
        ) : (
          <p>日付をクリックしてください</p>
        )}
      </div>

      {/* 範囲/複数切替 */}
      <div className="mt-4">
        <label>
          <input
            type="radio"
            value="multiple"
            checked={rangeMode === "multiple"}
            onChange={(e) => setRangeMode(e.target.value)}
          />
          複数日選択
        </label>
        <label className="ml-4">
          <input
            type="radio"
            value="range"
            checked={rangeMode === "range"}
            onChange={(e) => setRangeMode(e.target.value)}
          />
          範囲選択
        </label>
      </div>

      {/* 名前入力 */}
      <input
        type="text"
        placeholder="名前を入力"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="border p-2 my-4 w-full"
      />

      {/* 日程一覧 */}
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-[#004CA0] text-white">
            <th className="border p-2">タイトル</th>
            <th className="border p-2">日程</th>
            <th className="border p-2">時間帯</th>
            <th className="border p-2">参加</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((s) => (
            <tr key={s.id}>
              <td className="border p-2">{s.title}</td>
              <td className="border p-2">
                {s.start_date} ~ {s.end_date}
              </td>
              <td className="border p-2">{s.timeslot}</td>
              <td className="border p-2">
                <select
                  value={responses[s.id] || ""}
                  onChange={(e) => handleResponseChange(s.id, e.target.value)}
                  className="border p-1"
                >
                  <option value="">選択</option>
                  <option value="◯">◯</option>
                  <option value="✕">✕</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 保存ボタン */}
      <button
        onClick={handleSave}
        className="bg-[#FDB9C8] text-black px-4 py-2 mt-4 rounded-lg shadow hover:bg-[#004CA0] hover:text-white"
      >
        保存
      </button>
    </div>
  );
}
