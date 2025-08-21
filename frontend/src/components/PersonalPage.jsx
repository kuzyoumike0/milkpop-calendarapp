import React, { useState } from "react";

const PersonalPage = () => {
  const [schedules, setSchedules] = useState([]);
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");

  const handleAddSchedule = () => {
    if (!title) return;
    setSchedules([
      ...schedules,
      {
        id: Date.now(),
        title,
        memo,
        timeType: "終日",
        startTime: "01:00",
        endTime: "02:00",
      },
    ]);
    setTitle("");
    setMemo("");
  };

  const handleTimeTypeChange = (id, value) => {
    setSchedules(
      schedules.map((s) =>
        s.id === id ? { ...s, timeType: value } : s
      )
    );
  };

  const handleStartTimeChange = (id, value) => {
    setSchedules(
      schedules.map((s) =>
        s.id === id ? { ...s, startTime: value } : s
      )
    );
  };

  const handleEndTimeChange = (id, value) => {
    setSchedules(
      schedules.map((s) =>
        s.id === id ? { ...s, endTime: value } : s
      )
    );
  };

  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = (i + 1) % 24; // 1時〜0時
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  return (
    <div className="p-6 bg-black text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-[#FDB9C8]">
        MilkPOP Calendar - 個人スケジュール
      </h1>

      <div className="flex flex-col gap-2 mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="タイトルを入力"
          className="p-2 border rounded-lg text-black"
        />
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="メモを入力"
          className="p-2 border rounded-lg text-black"
        />
        <button
          onClick={handleAddSchedule}
          className="bg-[#FDB9C8] text-black px-4 py-2 rounded-lg"
        >
          追加
        </button>
      </div>

      <div className="space-y-4">
        {schedules.map((s) => (
          <div
            key={s.id}
            className="p-4 bg-[#004CA0] rounded-xl shadow-md"
          >
            <p className="font-semibold text-lg">{s.title}</p>
            <p className="text-sm text-gray-200">{s.memo}</p>

            <select
              value={s.timeType}
              onChange={(e) =>
                handleTimeTypeChange(s.id, e.target.value)
              }
              className="border p-2 rounded-lg mt-2 text-black"
            >
              <option>終日</option>
