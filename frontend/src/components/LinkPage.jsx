import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function LinkPage() {
  const [date, setDate] = useState(new Date());
  const [rangeMode, setRangeMode] = useState("multiple"); // multiple or range
  const [selectedDates, setSelectedDates] = useState([]);
  const [title, setTitle] = useState("");
  const [timeslot, setTimeslot] = useState("全日");
  const [shareLink, setShareLink] = useState("");

  // 日付クリック
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

  // 登録処理
  const handleSubmit = async () => {
    if (!title || selectedDates.length === 0) {
      alert("タイトルと日程を入力してください");
      return;
    }

    try {
      const start_date = selectedDates[0].toISOString().split("T")[0];
      const end_date = selectedDates[selectedDates.length - 1].toISOString().split("T")[0];

      const res = await axios.post("/api/schedule", {
        title,
        start_date,
        end_date,
        timeslot,
        range_mode: rangeMode,
      });

      setShareLink(res.data.link);
    } catch (err) {
      console.error("リンク作成エラー:", err);
      alert("リンク作成に失敗しました");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">共有スケジュール登録</h2>

      {/* タイトル */}
      <input
        type="text"
        placeholder="タイトルを入力"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
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

      {/* 範囲/複数切り替え */}
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

      {/* 時間帯 */}
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

      {/* 登録 */}
      <button
        onClick={handleSubmit}
        className="bg-[#FDB9C8] text-black px-4 py-2 mt-4 rounded-lg shadow hover:bg-[#004CA0] hover:text-white"
      >
        共有リンクを発行
      </button>

      {/* 発行リンク表示 */}
      {shareLink && (
        <div className="mt-4">
          <p>共有リンクが発行されました:</p>
          <a
            href={shareLink}
            className="text-[#004CA0] underline"
            target="_blank"
            rel="noreferrer"
          >
            {window.location.origin}{shareLink}
          </a>
        </div>
      )}
    </div>
  );
}
