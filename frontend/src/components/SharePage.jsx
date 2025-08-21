import React, { useState, useEffect } from "react";
import { fetchSchedules, addSchedule, updateSchedule } from "../api";

const SharePage = () => {
  const [schedules, setSchedules] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    fetchSchedules().then(setSchedules);
  }, []);

  const handleAddSchedule = async () => {
    if (!title) return;

    const newSchedule = {
      title,
      memo: "",
      timeType: "終日",
      startTime: "01:00",
      endTime: "02:00",
    };

    const saved = await addSchedule(newSchedule);
    setSchedules([saved, ...schedules]);
    setTitle("");
  };

  const handleTimeTypeChange = async (id, value, s) => {
    const updated = await updateSchedule(id, {
      timeType: value,
      startTime: s.start_time,
      endTime: s.end_time,
    });
    setSchedules(schedules.map((item) => (item.id === id ? updated : item)));
  };

  const handleStartTimeChange = async (id, value, s) => {
    const updated = await updateSchedule(id, {
      timeType: s.time_type,
      startTime: value,
      endTime: s.end_time,
    });
    setSchedules(schedules.map((item) => (item.id === id ? updated : item)));
  };

  const handleEndTimeChange = async (id, value, s) => {
    const updated = await updateSchedule(id, {
      timeType: s.time_type,
      startTime: s.start_time,
      endTime: value,
    });
    setSchedules(schedules.map((item) => (item.id === id ? updated : item)));
  };

  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = (i + 1) % 24;
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
            <p className="text-sm text-gray-600">{s.memo}</p>

            <select
              value={s.time_type}
              onChange={(e) =>
                handleTimeTypeChange(s.id, e.target.value, s)
              }
              className="border p-2 rounded-lg mt-2"
            >
              <option>終日</option>
              <option>昼</option>
              <option>夜</option>
              <option>時間帯</option>
            </select>

            {s.time_type === "時間帯" && (
              <div className="flex gap-2 mt-2">
                <select
                  value={s.start_time}
                  onChange={(e) =>
                    handleStartTimeChange(s.id, e.target.value, s)
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
                  value={s.end_time}
                  onChange={(e) =>
                    handleEndTimeChange(s.id, e.target.value, s)
                  }
                  className="border p-2 rounded-lg"
                >
                  {timeOptions.map((t) => (
                    <option
                      key={t}
                      value={t}
                      disabled={t <= s.start_time}
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
