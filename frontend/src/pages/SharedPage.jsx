import React, { useState } from 'react'
import axios from 'axios'

export default function SharedPage(){
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [mode, setMode] = useState('slot') // slot | time
  const [slot, setSlot] = useState('全日')
  const [start, setStart] = useState('09:00')
  const [end, setEnd] = useState('18:00')
  const [shareLink, setShareLink] = useState('')

  const create = async ()=>{
    const payload = { title, date, time_mode: mode, slot, start_time:start, end_time:end }
    const { data } = await axios.post('/api/share', payload)
    const url = `${window.location.origin}${data.link}`
    setShareLink(url)
  }

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4 text-[var(--pink)]">共有スケジュール作成</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-2 text-sm opacity-80">タイトル</label>
          <input className="w-full rounded-lg px-3 py-2 text-black" value={title} onChange={e=>setTitle(e.target.value)} placeholder="例）ランチ打合せ" />
        </div>
        <div>
          <label className="block mb-2 text-sm opacity-80">日付</label>
          <input type="date" className="w-full rounded-lg px-3 py-2 text-black" value={date} onChange={e=>setDate(e.target.value)} />
        </div>
        <div>
          <label className="block mb-2 text-sm opacity-80">入力方式</label>
          <select className="w-full rounded-lg px-3 py-2 text-black" value={mode} onChange={e=>setMode(e.target.value)}>
            <option value="slot">プルダウン（全日/昼/夜）</option>
            <option value="time">時間指定</option>
          </select>
        </div>
        <div>
          {mode==='slot' ? (
            <>
              <label className="block mb-2 text-sm opacity-80">時間帯</label>
              <select className="w-full rounded-lg px-3 py-2 text-black" value={slot} onChange={e=>setSlot(e.target.value)}>
                <option>全日</option><option>昼</option><option>夜</option>
              </select>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="block mb-2 text-sm opacity-80">開始</label>
                <select className="w-full rounded-lg px-3 py-2 text-black" value={start} onChange={e=>setStart(e.target.value)}>
                  {Array.from({length:24},(_,i)=>`${String(i).padStart(2,'0')}:00`).map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <span className="mt-7">〜</span>
              <div className="flex-1">
                <label className="block mb-2 text-sm opacity-80">終了</label>
                <select className="w-full rounded-lg px-3 py-2 text-black" value={end} onChange={e=>setEnd(e.target.value)}>
                  {Array.from({length:24},(_,i)=>`${String(i).padStart(2,'0')}:00`).map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-5">
        <button className="brand-btn" onClick={create}>共有リンクを発行</button>
      </div>
      {shareLink && (
        <div className="mt-4 text-sm">
          共有リンク： <a href={shareLink} className="underline text-[var(--pink)]">{shareLink}</a>
          <button className="ml-2 brand-btn" onClick={()=>navigator.clipboard.writeText(shareLink)}>コピー</button>
        </div>
      )}
    </div>
  )
}
