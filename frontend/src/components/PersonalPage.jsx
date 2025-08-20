import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function PersonalPage() {
  const [date, setDate] = useState(new Date());
  const [rangeMode, setRangeMode] = useState("multiple"); // "multiple" or "range"
  const [selectedDates, setSelectedDates] = useState([]);
  const [username, setUsername] = useState("");
  const [timeslot, setTimeslot] = useState("全日");

  // 日付クリック処理
  const handleDateClick = (value) => {
    if (rangeMode === "multiple") {
      // 複数日選択モード
      if (selectedDates.some((d) => d.toDateString() === value.toDateString())) {
        setSelectedDates(selectedDates.filter((d) => d.toDateString() !== value.toDateString()));
      } else {
        setSelectedDates([...selectedDates, value]);
      }
    } else if (rangeMode === "range") {
      // 範囲選択モード
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

  // 登録処理
  const handleSubmit = async () => {
    if (!username || selectedDates.length === 0) {
      alert("名前と日程を入力してください");
      return;
    }

    try {
      const start_date = selectedDates[0].toISOString().split("T")[0];
      const end_date = selectedDates[selectedDates.length - 1].toISOString().split("T")[0];

      await axios.post("/api/personal", {
        username,
        start_date,
        end_date,
        timeslot,
        range_mode: rangeMode,
      });

      alert("登録しました！");
    } catch (err) {
      console.error("登録エラー:", err);
      alert("登録に失敗しました");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">個人スケジュール登録</h2>

      {/* 名前入力 */}
      <input
        type="text"
        placeholder="名前を入力"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="border p-2 mb-4 w-full"
      />

      {/* カレンダー */}
      <Calendar
        onClickDay={handleDateClick}
        value={date}
        onChange={setDate}
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

      {/* 範囲/複数選択モード切り替え */}
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

      {/* 時間帯プルダウン */}
      <div className="mt-4">
        <select
          value={timeslot}
          onChange={(e) => setTimeslot(e.target.value)}
          className="border p-2"
        >
          <option value="全日">全日</option>
          <option value="昼">昼</option>
          <option value="夜">夜</option>
        </select>
      </div>

      {/* 登録ボタン */}
      <button
        onClick={handleSubmit}
        className="bg-[#004CA0] text-white px-4 py-2 mt-4 rounded-lg shadow"
      >
        登録
      </button>
    </div>
  );
}
