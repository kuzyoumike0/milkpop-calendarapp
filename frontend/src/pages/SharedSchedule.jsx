import React, { useState } from "react";
import CustomCalendar from "../components/CustomCalendar";

export default function SharedSchedule(){
  const [date, setDate] = useState(new Date());
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState("slot");
  const [slot, setSlot] = useState("全日");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("18:00");
  const [shareLink, setShareLink] = useState("");

  async function createShare(){
    const res = await fetch("/api/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        username: "guest",
        memo: "",
        date: date.toISOString().slice(0,10),
        time_slot: mode === "slot" ? slot : `${start}-${end}`
      })
    });
    const data = await res.json();
    const url = `${window.location.origin}/shared/${data.id}`; // ★ 共有URLを画面に表示
    setShareLink(url);
  }

  return (
    <div className="glass p-6 space-y-6">
      <h2 className="text-xl font-bold text-primary">共有スケジュール</h2>
      <CustomCalendar value={date} onChange={setDate} />

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-white/80 mb-2">タイトル</label>
          <input className="w-full rounded-xl px-3 py-2 text-black" value={title} onChange={e=>setTitle(e.target.value)} placeholder="例）ランチ打合せ" />
        </div>
        <div>
          <label className="block text-sm text-white/80 mb-2">入力方式</label>
          <select className="w-full rounded-xl px-3 py-2 text-black" value={mode} onChange={e=>setMode(e.target.value)}>
            <option value="slot">プルダウン（全日/昼/夜）</option>
            <option value="time">時間指定（開始〜終了）</option>
          </select>
        </div>
      </div>

      {mode === "slot" ? (
        <div>
          <label className="block text-sm text-white/80 mb-2">時間帯</label>
          <select className="w-full rounded-xl px-3 py-2 text-black" value={slot} onChange={e=>setSlot(e.target.value)}>
            <option>全日</option><option>昼</option><option>夜</option>
          </select>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-sm text-white/80 mb-2">開始</label>
            <select className="w-full rounded-xl px-3 py-2 text-black" value={start} onChange={e=>setStart(e.target.value)}>
              {Array.from({length:24},(_,i)=>`${String(i).padStart(2,'0')}:00`).map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-2">終了</label>
            <select className="w-full rounded-xl px-3 py-2 text-black" value={end} onChange={e=>setEnd(e.target.value)}>
              {Array.from({length:24},(_,i)=>`${String(i).padStart(2,'0')}:00`).map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button className="px-4 py-2 rounded-xl font-semibold bg-white text-black" onClick={createShare}>共有リンクを発行</button>
      </div>

      {shareLink && (
        <div className="glass p-4 text-sm">
          <div className="text-white/80 mb-1">共有リンク</div>
          <a className="underline text-primary break-all" href={shareLink} target="_blank" rel="noreferrer">{shareLink}</a>
        </div>
      )}
    </div>
  )
}
