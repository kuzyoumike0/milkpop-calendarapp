import React, { useState, useEffect } from "react";
import axios from "axios";

export default function PersonalPage() {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    axios.get("/api/schedules").then(res => setSchedules(res.data));
  }, []);

  return (
    <div className="max-w-3xl mx-auto bg-[#111] p-6 rounded-2xl shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-[#FDB9C8]">個人スケジュール一覧</h2>
      <ul className="space-y-4">
        {schedules.map(s => (
          <li key={s.id} className="bg-[#222] p-4 rounded-xl shadow-md">
            <div className="font-bold text-lg text-[#FDB9C8]">{s.title}</div>
            <div className="text-sm text-gray-300">
              {s.start_date} ~ {s.end_date} [{s.timeslot}]
            </div>
            {s.memo && <div className="mt-1 text-gray-400">{s.memo}</div>}
          </li>
        ))}
      </ul>
      {schedules.length === 0 && (
        <p className="text-gray-400">まだスケジュールが登録されていません。</p>
      )}
    </div>
  );
}
