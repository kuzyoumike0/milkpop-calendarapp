import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function SharedLink(){
  const { id } = useParams();
  const [info, setInfo] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [username, setUsername] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [timeslot, setTimeslot] = useState("全日");
  const [memo, setMemo] = useState("");

  const load = async () => {
    const res = await axios.get(`/api/share/${id}`);
    setInfo(res.data);
    const ans = await axios.get(`/api/share/${id}/answers`);
    setAnswers(ans.data);
  };
  useEffect(()=>{ load(); }, [id]);

  const add = async () => {
    const r = await axios.post(`/api/share/${id}/answers`, { username, event_date: eventDate, timeslot, memo });
    setUsername(""); setEventDate(""); setTimeslot("全日"); setMemo("");
    await load();
  };
  const del = async (answerId) => {
    await axios.delete(`/api/answers/${answerId}`);
    await load();
  };

  if (!info) return <div>Loading...</div>;
  const dates = info.dates || [];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">共有リンク</h2>
      <div className="opacity-80">タイトル: {info.event.title}</div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">候補日一覧</h3>
          <ul className="list-disc pl-6">
            {dates.map(d => (
              <li key={d.id}>{new Date(d.event_date).toISOString().slice(0,10)}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">参加登録</h3>
          <input className="glass w-full p-2 mb-2" placeholder="ユーザー名" value={username} onChange={e=>setUsername(e.target.value)} />
          <select className="glass w-full p-2 mb-2" value={eventDate} onChange={e=>setEventDate(e.target.value)}>
            <option value="">日付を選択</option>
            {dates.map(d => {
              const iso = new Date(d.event_date).toISOString().slice(0,10);
              return <option key={d.id} value={iso}>{iso}</option>;
            })}
          </select>
          <select className="glass w-full p-2 mb-2" value={timeslot} onChange={e=>setTimeslot(e.target.value)}>
            <option>全日</option>
            <option>昼</option>
            <option>夜</option>
          </select>
          <textarea className="glass w-full p-2 mb-2" placeholder="メモ" value={memo} onChange={e=>setMemo(e.target.value)} />
          <button className="btn-primary" onClick={add}>登録</button>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">登録一覧</h3>
        <ul className="space-y-2">
          {answers.map(a => (
            <li key={a.id} className="glass p-3 flex items-center justify-between">
              <div>
                <div className="font-semibold">{a.username}</div>
                <div className="text-sm opacity-70">{a.event_date} / {a.timeslot} / {a.memo || "-"}</div>
              </div>
              <button className="btn bg-brandBlack text-white" onClick={()=>del(a.id)}>削除</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
