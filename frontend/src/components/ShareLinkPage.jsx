import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ShareLinkPage() {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    axios.get("/api/schedules").then(res => setSchedules(res.data));
  }, []);

  return (
    <div className="max-w-3xl mx-auto bg-[#111] p-6 rounded-2xl shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-[#FDB9C8]">発行された共有リンク一覧</h2>
      <ul className="space-y-4">
        {schedules.map(s => (
          <li key={s.id} className="bg-[#222] p-4 rounded-xl shadow-md">
            <div className="font-bold text-lg text-[#FDB9C8]">{s.title}</div>
            <a
              href={`/share/${s.linkid}`}
              className="text-blue-400 hover:text-[#FDB9C8] break-all"
            >
              {window.location.origin}/share/{s.linkid}
            </a>
          </li>
        ))}
      </ul>
      {schedules.length === 0 && (
        <p className="text-gray-400">まだリンクが発行されていません。</p>
      )}
    </div>
  );
}
