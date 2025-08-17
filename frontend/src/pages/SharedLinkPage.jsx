import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

export default function SharedLinkPage(){
  const { id } = useParams()
  const [info, setInfo] = useState(null)
  const [username, setUsername] = useState('')
  const [memo, setMemo] = useState('')
  const [timeMode, setTimeMode] = useState('slot')
  const [slot, setSlot] = useState('全日')
  const [start, setStart] = useState('09:00')
  const [end, setEnd] = useState('18:00')

  useEffect(()=>{
    axios.get(`/api/share/${id}`).then(res=>setInfo(res.data || null)).catch(()=>setInfo(null))
  }, [id])

  const submit = async ()=>{
    const payload = { username, memo, time_mode: timeMode, slot, start_time:start, end_time:end }
    await axios.post(`/api/share/${id}/register`, payload)
    alert('送信しました。ありがとうございます！')
    setUsername(''); setMemo('')
  }

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-2 text-[var(--pink)]">共有スケジュール</h2>
      {info ? (
        <div className="mb-4">
          <div>タイトル：{info.title}</div>
          {info.date && <div>日付：{info.date}</div>}
          {info.time_mode && <div>形式：{info.time_mode}</div>}
        </div>
      ) : (
        <div className="opacity-70 mb-4">リンク情報の取得に失敗しました（作成直後は未登録でもOK）。</div>
      )}
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="block mb-2 text-sm opacity-80">お名前</label>
          <input className="w-full rounded-lg px-3 py-2 text-black" value={username} onChange={e=>setUsername(e.target.value)} placeholder="お名前" />
        </div>
        <div>
          <label className="block mb-2 text-sm opacity-80">メモ</label>
          <input className="w-full rounded-lg px-3 py-2 text-black" value={memo} onChange={e=>setMemo(e.target.value)} placeholder="メモ（任意）" />
        </div>
        <div>
          <label className="block mb-2 text-sm opacity-80">入力方式</label>
          <div className="flex gap-3">
            <label><input type="radio" checked={timeMode==='slot'} onChange={()=>setTimeMode('slot')} /> プルダウン</label>
            <label><input type="radio" checked={timeMode==='time'} onChange={()=>setTimeMode('time')} /> 時間指定</label>
          </div>
        </div>
        <div>
          {timeMode==='slot' ? (
            <select className="w-full rounded-lg px-3 py-2 text-black" value={slot} onChange={e=>setSlot(e.target.value)}>
              <option>全日</option><option>昼</option><option>夜</option>
            </select>
          ) : (
            <div className="flex gap-2 items-center">
              <select className="w-full rounded-lg px-3 py-2 text-black" value={start} onChange={e=>setStart(e.target.value)}>
                {Array.from({length:24},(_,i)=>`${String(i).padStart(2,'0')}:00`).map(t=><option key={t}>{t}</option>)}
              </select>
              <span>〜</span>
              <select className="w-full rounded-lg px-3 py-2 text-black" value={end} onChange={e=>setEnd(e.target.value)}>
                {Array.from({length:24},(_,i)=>`${String(i).padStart(2,'0')}:00`).map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>
      <div className="mt-4">
        <button className="brand-btn" onClick={submit}>この内容で送信</button>
      </div>
    </div>
  )
}
