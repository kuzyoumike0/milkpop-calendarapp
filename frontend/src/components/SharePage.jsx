import React, { useState } from "react";

const SharePage = () => {
  const [schedules, setSchedules] = useState([]);
  const [title, setTitle] = useState("");

  const handleAddSchedule = () => {
    if (!title) return;
    setSchedules([
      ...schedules,
      {
        id: Date.now(),
        title,
        timeType: "終日",
        startTime: "01:00",
        endTime: "02:00",
      },
    ]);
    setTitle("");
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
    <div className="p-6 bg-[#FDB9C8] min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-[#004CA0]">
        MilkPOP Calendar - 日程登録
      </h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="タイトルを入力"
          className="p-2 border rounded-lg flex-1"
        />
        <button
          onClick={handleAddSchedule}
          className="bg-[#004CA0] text-white px-4 py-2 rounded-lg"
        >
          追加
        </button>
      </div>

      <div className="space-y-4">
        {schedules.map((s) => (
          <div
            key={s.id}
            className="p-4 bg-white rounded-xl shadow-md"
          >
            <p className="font-semibold">{s.title}</p>
            <select
              value={s.timeType}
              onChange={(e) =>
                handleTimeTypeChange(s.id, e.target.value)
              }
              className="border p-2 rounded-lg mt-2"
            >
              <option>終日</option>
              <option>昼</option>
              <option>夜</option>
              <option>時間帯</option>
            </select>

            {s.timeType === "時間帯" && (
              <div className="flex gap-2 mt-2">
                <select
                  value={s.startTime}
                  onChange={(e) =>
                    handleStartTimeChange(s.id, e.target.value)
                  }
                  className="border p-2 rounded-lg"
                >
                  {timeOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <span>〜</span>
                <select
                  value={s.endTime}
                  onChange={(e) =>
                    handleEndTimeChange(s.id, e.target.value)
                  }
                  className="border p-2 rounded-lg"
                >
                  {timeOptions.map((t) => (
                    <option
                      key={t}
                      value={t}
                      disabled={t <= s.startTime} // 開始時刻より後のみ選択可
                    >
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SharePage;
