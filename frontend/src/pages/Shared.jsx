import React, { useEffect, useState } from 'react';
import { addShared } from '../api';

export default function Shared() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('全日');
  const [createdBy, setCreatedBy] = useState('');

  const fetchShared = async () => {
    const res = await fetch('/api/shared');
    const data = await res.json();
    setItems(data);
  };

  useEffect(() => { fetchShared(); }, []);

  const submitShared = async (e) => {
    e.preventDefault();
    await addShared({ title, date, time_slot: timeSlot });
    setTitle(''); setDate(''); setTimeSlot('全日'); setCreatedBy('');
    fetchShared();
  };

  const del = async (id) => {
    await fetch('/api/shared/' + id, { method: 'DELETE' });
    fetchShared();
  };

  return (
    <section className="card">
      <h2>共有スケジュール（DBのみ / Googleカレンダー機能なし）</h2>
      <form className="row" onSubmit={submitShared}>
        <input className="input" placeholder="タイトル" value={title} onChange={e=>setTitle(e.target.value)} required />
        <input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)} required />
        <select className="select" value={timeSlot} onChange={e=>setTimeSlot(e.target.value)}>
          <option>全日</option><option>昼</option><option>夜</option>
        </select>
                <button className="button" type="submit">追加</button>
      </form>

      <h3 style={{marginTop:16}}>共有DBの予定</h3>
      <ul className="list">
        {items.map(it => (
          <li key={it.id} className="item">
            <strong>{it.date}</strong> [{it.time_slot}] {it.title}
            {it.created_by ? <span className="tag">{it.created_by}</span> : null}
            <button className="button" style={{marginLeft:'auto'}} onClick={()=>del(it.id)}>削除</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
