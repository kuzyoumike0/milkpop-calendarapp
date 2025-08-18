import React, {useEffect, useState} from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

export default function SharedLink(){
  const { id } = useParams()
  const [events, setEvents] = useState([])
  const [username, setUsername] = useState("")
  const [title, setTitle] = useState("")
  const [memo, setMemo] = useState("")
  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")

  const reload = async ()=>{
    const res = await axios.get('/api/schedules', { params: { linkId: id } })
    setEvents(res.data)
  }

  useEffect(()=>{ reload() }, [id])

  const add = async ()=>{
    if(!title || !start || !end) return alert("タイトルと期間を入力してください")
    await axios.post('/api/schedules', { title, memo: username ? `${username}: ${memo}` : memo, start_date: start, end_date: end, link_id: id })
    setTitle(""); setMemo(""); setStart(""); setEnd(""); setUsername("")
    reload()
  }

  const del = async (eid)=>{
    await axios.delete(`/api/schedules/${eid}`)
    reload()
  }

  return (
    <section className="glass p-6">
      <h2 className="text-2xl font-bold text-accent mb-4">共有リンク</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="space-y-2">
            <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="ユーザー名（任意）" className="w-full px-3 py-2 rounded bg-transparent border border-white/10 focus:border-accentSub outline-none"/>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="タイトル" className="w-full px-3 py-2 rounded bg-transparent border border-white/10 focus:border-accentSub outline-none"/>
            <input type="date" value={start} onChange={e=>setStart(e.target.value)} className="w-full px-3 py-2 rounded bg-transparent border border-white/10 focus:border-accentSub outline-none"/>
            <input type="date" value={end} onChange={e=>setEnd(e.target.value)} className="w-full px-3 py-2 rounded bg-transparent border border-white/10 focus:border-accentSub outline-none"/>
            <textarea value={memo} onChange={e=>setMemo(e.target.value)} placeholder="メモ（任意）" className="w-full px-3 py-2 rounded bg-transparent border border-white/10 focus:border-accentSub outline-none"/>
            <button onClick={add} className="w-full px-4 py-2 rounded-lg bg-accent text-[#121212] font-bold hover:bg-accentSub transition">登録</button>
          </div>
        </div>
        <div>
          <h3 className="font-bold mb-2">登録済み</h3>
          <ul className="space-y-2">
            {events.map(ev => (
              <li key={ev.id} className="p-3 rounded border border-white/10 flex justify-between items-center">
                <div>
                  <div className="font-bold">{ev.title}</div>
                  <div className="text-sm text-textSub">{ev.start_date} 〜 {ev.end_date}</div>
                  {ev.memo && <div className="text-sm">{ev.memo}</div>}
                </div>
                <button onClick={()=>del(ev.id)} className="px-3 py-1 rounded bg-red-500 text-white">削除</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
