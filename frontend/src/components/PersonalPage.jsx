import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function PersonalPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [mode, setMode] = useState("multiple"); // "multiple" or "range"
  const [selectedDates, setSelectedDates] = useState([]);
  const [rangeDates, setRangeDates] = useState([null, null]);
  const [saved, setSaved] = useState(null);

  // 日付を yyyy-mm-dd に整形
  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // 複数選択モード用クリック処理
  const handleDateClick = (date) => {
    const formatted = formatDate(date);
    if (selectedDates.includes(formatted)) {
      setSelectedDates(selectedDates.filter((d) => d !== formatted));
    } else {
      setSelectedDates([...selectedDates, formatted]);
    }
  };

  // 範囲選択モード
  const handleRangeChange = (range) => {
    setRangeDates(range);
  };

  // 保存処理
  const handleSave = async () => {
    let dates = [];

    if (mode === "multiple") {
      dates = selectedDates;
    } else if (mode === "range" && rangeDates[0] && rangeDates[1]) {
      // 開始〜終了を配列化
      const start = new Date(rangeDates[0]);
      const end = new Date(rangeDates[1]);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(formatDate(new Date(d)));
      }
    }

    try {
      const res = await axios.post("/api/schedule", {
        title,
        memo,
        dates,
        timeslot: "personal" // 個人用の識別
      });
      setSaved({ title, memo, dates });
      alert("保存しました！");
    } catch (err) {
      console.error("保存エラー:", err);
      alert("保存に失敗しました");
    }
  };

  return (
    <div>
      <div className="header">MilkPOP Calendar</div>
      <div className="flex justify-center items-center min-h-screen">
        <div className="card w-11/12 md:w-2/3">
          <h2 className="text-xl font-bold mb-4">個人スケジュール登録</h2>

          {/* タイトル入力 */}
          <input
            type="text"
            placeholder="タイトルを入力"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 mb-4 rounded-lg border"
          />

          {/* メモ入力 */}
          <textarea
            placeholder="メモを入力"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="w-full p-2 mb-4 rounded-lg border"
          />

          {/* モード切替 */}
          <div className="flex gap-4 mb-4">
            <label>
              <input
                type="radio"
                name="mode"
                value="multiple"
                checked={mode === "multiple"}
                onChange={() => setMode("multiple")}
              />
              複数選択
            </label>
            <label>
              <input
                type="radio"
                name="mode"
                value="range"
                checked={mode === "range"}
                onChange={() => setMode("range")}
              />
              範囲選択
            </label>
          </div>

          {/* カレンダー */}
          <Calendar
            selectRange={mode === "range"}
            onClickDay={(date) => {
              if (mode === "multiple") handleDateClick(date);
            }}
            onChange={(range) => {
              if (mode === "range") handleRangeChange(range);
            }}
            value={mode === "range" ? rangeDates : null}
            tileClassName={({ date }) => {
              const formatted = formatDate(date);
              if (mode === "multiple" && selectedDates.includes(formatted)) {
                return "bg-pink-300 rounded-full text-black font-bold";
              }
              return "";
            }}
          />

          {/* 選択結果を表示 */}
          <div className="mt-4 text-sm">
            {mode === "multiple" && selectedDates.length > 0 && (
              <p>選択した日付: {selectedDates.join(", ")}</p>
            )}
            {mode === "range" && rangeDates[0] && rangeDates[1] && (
              <p>
                範囲: {formatDate(rangeDates[0])} 〜 {formatDate(rangeDates[1])}
              </p>
            )}
          </div>

          <button onClick={handleSave} className="btn-main mt-4">
            登録する
          </button>

          {/* 保存結果を表示 */}
          {saved && (
            <div className="mt-6 text-sm">
              <h3 className="font-bold mb-2">登録済みスケジュール</h3>
              <p>タイトル: {saved.title}</p>
              <p>メモ: {saved.memo}</p>
              <p>日付: {saved.dates.join(", ")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
