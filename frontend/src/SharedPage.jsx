import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function SharedPage() {
  const [schedules, setSchedules] = useState([]);
  useEffect(() => { (async()=>{
    const res = await axios.get('/api/schedules');
    setSchedules(res.data);
  })(); }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">🤝 共有スケジュール</h2>
      <ul>
        {schedules.map(s=>(
          <li key={s.id} className="bg-white/50 rounded p-2 mb-2 shadow">
            {s.date} [{s.time_slot}] {s.title} ({s.username}) - {s.memo}
          </li>
        ))}
      </ul>
      <p className="text-sm text-gray-500 mt-4">🔗 このページのURLを共有してみんなで予定を確認できます</p>
    </div>
  );
}