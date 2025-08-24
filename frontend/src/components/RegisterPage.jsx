import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function RegisterPage() {
  const [title, setTitle] = useState("");
  const [selectionType, setSelectionType] = useState("multiple"); // デフォルト: 複数選択
  const [selectedDates, setSelectedDates] = useState([]);
  const [range, setRange] = useState({ start: "", end: "" });

  const handleRadioChange = (e) => {
    setSelectionType(e.target.value);
    setSelectedDates([]);
    setRange({ start: "", end: "" });
  };

  const handleDateClick = (date) => {
    if (selectionType === "multiple") {
      setSelectedDates((prev) =>
        prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
      );
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload =
      selectionType === "multiple"
        ? { title, dates: selectedDates }
        : { title, range };

    console.log("登録データ:", payload);
    alert("登録しました！");
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-[#FDB9C8] to-[#004CA0] text-white">
      {/* バナー */}
      <header className="w-full bg-black bg-opacity-70 py-4 px-6 flex justify-between items-center shadow-lg">
        <h1 className="text-2xl font-bold">MilkPOP Calendar</h1>
        <nav className="space-x-4">
          <Link to="/" className="hover:underline">トップ</Link>
          <Link to="/personal" className="hover:underline">個人スケジュール</Link>
        </nav>
      </header>

      {/* カード */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl p-6">
        <div className="bg-black bg-opacity-50 rounded-2xl shadow-xl p-6 w-full">
          <h2 className="text-xl font-semibold mb-4 text-center">日程登録</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* タイトル入力 */}
            <input
              type="text"
              placeholder="タイトルを入力"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-black"
            />

            {/* ラジオボタン */}
            <div className="flex space-x-6 items-center">
              <label>
                <input
                  type="radio"
                  value="multiple"
                  checked={selectionType === "multiple"}
                  onChange={handleRadioChange}
                />
                複数選択
              </label>
              <label>
                <input
                  type="radio"
                  value="range"
                  checked={selectionType === "range"}
                  onChange={handleRadioChange}
                />
                範囲選択
              </label>
            </div>

            {/* 選択UI */}
            {selectionType === "multiple" ? (
              <div className="bg-white text-black rounded-xl p-3">
                <p className="mb-2 font-semibold">選択した日付（例: 2025-08-25）:</p>
                <button
                  type="button"
                  onClick={() => handleDateClick("2025-08-25")}
                  className={`px-3 py-1 rounded-lg ${
                    selectedDates.includes("2025-08-25")
                      ? "bg-[#FDB9C8] text-white"
                      : "bg-gray-200"
                  }`}
                >
                  2025-08-25
                </button>
              </div>
            ) : (
              <div className="bg-white text-black rounded-xl p-3 space-y-2">
                <p className="font-semibold">範囲を選択してください:</p>
                <input
                  type="date"
                  value={range.start}
                  onChange={(e) => setRange({ ...range, start: e.target.value })}
                  className="px-2 py-1 rounded-lg border"
                />
                <span className="mx-2">〜</span>
                <input
                  type="date"
                  value={range.end}
                  onChange={(e) => setRange({ ...range, end: e.target.value })}
                  className="px-2 py-1 rounded-lg border"
                />
              </div>
            )}

            {/* 登録ボタン */}
            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-[#FDB9C8] hover:bg-[#e89cab] text-black font-bold"
            >
              登録する
            </button>
          </form>
        </div>
      </main>

      {/* フッター */}
      <footer className="w-full py-4 bg-black bg-opacity-70 text-center text-sm">
        © 2025 MilkPOP Calendar
      </footer>
    </div>
  );
}
