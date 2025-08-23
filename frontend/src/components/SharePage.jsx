import React, { useEffect, useState } from "react";

const SharePage = () => {
  const [schedules, setSchedules] = useState([]);

  const fetchSchedules = async () => {
    try {
      const res = await fetch("/api/schedules");
      const data = await res.json();
      setSchedules(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  return (
    <div className="p-6 bg-gradient-to-b from-[#FDB9C8] via-white to-[#004CA0] min-h-screen">
      <header className="bg-black text-white text-center py-4 mb-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold">MilkPOP Calendar</h1>
      </header>

      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-xl font-bold text-[#004CA0] mb-4">登録済み日程</h2>
        <ul className="space-y-3">
          {schedules.map((s) => (
            <li key={s.id} className="border p-4 rounded-xl shadow-sm">
              <p className="font-bold">{s.title}</p>
              <p>{new Date(s.date).toLocaleDateString()}</p>
              <p>選択方法: {s.selection_mode}</p>
              <p>時間帯: {s.time_type}</p>
              {s.time_type === "custom" && (
                <p>
                  {s.start_time} ~ {s.end_time}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SharePage;
