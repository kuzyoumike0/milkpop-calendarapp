import React, { useEffect, useState } from 'react';
import { listShared, addShared } from '../api';

export default function Shared() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('全日');
  const [createdBy, setCreatedBy] = useState('');

  const fetchData = async () => {
    const res = await listShared();
    setItems(res.data);
  };

  useEffect(() => { fetchData(); }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    await addShared({ title, date, time_slot: timeSlot, created_by: createdBy });
    setTitle(''); setDate(''); setTimeSlot('全日'); setCreatedBy('');
    fetchData();
  };

  return (
    <section className="card">
      <h2>共有スケジュール</h2>
      <form onSubmit={onSubmit} className="row" style={{alignItems:'center'}}>
        <input className="input" placeholder="タイトル" value={title} onChange={e=>setTitle(e.target.value)} required />
        <input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)} required />
        <select className="select" value={timeSlot} onChange={e=>setTimeSlot(e.target.value)}>
          <option>全日</option><option>昼</option><option>夜</option>
        </select>
        <input className="input" placeholder="作成者" value={createdBy} onChange={e=>setCreatedBy(e.target.value)} required />
        <button className="button" type="submit">追加</button>
      </form>
      <ul className="list" style={{marginTop:12}}>
        {items.map(it => (
          <li key={it.id} className="item">
            {it.date} [{it.time_slot}] {it.title} <span className="tag">{it.created_by}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
