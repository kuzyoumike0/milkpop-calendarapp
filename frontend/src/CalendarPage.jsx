import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function CalendarPage() {
  const [schedules, setSchedules] = useState([]);
  const [form, setForm] = useState({ date:'', time_slot:'全日', title:'', username:'', memo:'' });

  const load = async () => {
    const res = await axios.get('/api/schedules');
    setSchedules(res.data);
  };
  useEffect(() => { load(); }, []);

  const submit = async () => {
    await axios.post('/api/schedules', form);
    setForm({ date:'', time_slot:'全日', title:'', username:'', memo:'' });
    load();
  };

  const del = async (id) => {
    await axios.delete(`/api/schedules/${id}`);
    load();
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">📅 個人スケジュール</h2>
      <div className="flex flex-col gap-2 mb-4">
        <input className="p-2 rounded" type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} />
        <select className="p-2 rounded" value={form.time_slot} onChange={e=>setForm({...form,time_slot:e.target.value})}>
          <option>全日</option><option>朝</option><option>昼</option><option>夜</option>
        </select>
        <input className="p-2 rounded" placeholder="タイトル" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
        <input className="p-2 rounded" placeholder="ユーザー名" value={form.username} onChange={e=>setForm({...form,username:e.target.value})} />
        <textarea className="p-2 rounded" placeholder="メモ" value={form.memo} onChange={e=>setForm({...form,memo:e.target.value})}></textarea>
        <button onClick={submit} className="bg-blue-500 text-white px-4 py-2 rounded">追加</button>
      </div>
      <ul>
        {schedules.map(s=>(
          <li key={s.id} className="bg-white/50 rounded p-2 mb-2 shadow">
            {s.date} [{s.time_slot}] {s.title} ({s.username}) - {s.memo}
            <button onClick={()=>del(s.id)} className="ml-2 text-red-600">削除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}