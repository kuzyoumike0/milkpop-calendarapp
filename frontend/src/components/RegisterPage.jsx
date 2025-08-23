import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../index.css";

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date());
  const [selectionMode, setSelectionMode] = useState("range"); // range or multiple
  const [timeType, setTimeType] = useState("allDay");

  const handleSave = () => {
    console.log({
      title,
      date,
      selectionMode,
      timeType,
    });
    alert("登録しました！");
  };

  return (
    <div className="p-6 bg-gradient-to-b from-[#FDB9C8] via-white to-[#004CA0] min-h-screen">
      {/* ===== バナー ===== */}
      <header className="bg-black text-white text-center py-4 mb-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold">MilkPOP Calendar</h1>
      </header>

      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        {/* タイトル入力 */}
        <div className="mb-6">
          <label className="block text-lg font-semibold text-[#004CA0] mb-2">
            タイトル
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#FDB9C8] focus:outline-none"
            placeholder="タイトルを入力してください"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* ===== ラジオボタンエリア ===== */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[#004CA0] mb-3">選択方法</h2>
          <div className="flex gap-6">
            <label className="cursor-pointer flex items-center space-x-2 bg-[#FDB9C8] px-4 py-2 rounded-full shadow hover:bg-[#004CA0] hover:text-white transition">
              <input
                type="radio"
                name="selectionMode"
                value="range"
                checked={selectionMode === "range"}
                onChange={() => setSelectionMode("range")}
                className="hidden"
              />
              <span className="font-semibold">範囲選択</span>
            </label>
            <label className="cursor-pointer flex items-center space-x-2 bg-[#FDB9C8] px-4 py-2 rounded-full shadow hover:bg-[#004CA0] hover:text-white transition">
              <input
                type="radio"
                name="selectionMode"
                value="multiple"
                checked={selectionMode === "multiple"}
                onChange={() => setSelectionMode("multiple")}
                className="hidden"
              />
              <span className="font-semibold">複数選択</span>
            </label>
          </div>
        </div>

        {/* ===== カレンダー ===== */}
        <div className="custom-calendar mb-8">
          <Calendar
            onChange={setDate}
            value={date}
            selectRange={selectionMode === "range"}
            // react-calendar の複数選択対応はカスタム必要（今回は簡易版）
          />
        </div>

        {/* 時間帯選択 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[#004CA0] mb-3">時間帯</h2>
          <select
            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#FDB9C8] focus:outline-none"
            value={timeType}
            onChange={(e) => setTimeType(e.target.value)}
          >
            <option value="allDay">終日</option>
            <option value="morning">午前</option>
            <option value="afternoon">午後</option>
            <option value="custom">時間指定</option>
          </select>
        </div>

        {/* 保存ボタン */}
        <button
          onClick={handleSave}
          className="w-full bg-[#004CA0] text-white font-bold py-3 rounded-xl shadow hover:bg-[#FDB9C8] hover:text-black transition"
        >
          登録する
        </button>
      </div>
    </div>
  );
};

export default RegisterPage;
