import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'

export default function ShareLink() {
  const { id } = useParams()
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ username:'', title:'', memo:'', start_date:'', end_date:'' })

  const load = async () => {
    const res = await axios.get('/api/shared/'+id)
    setItems(res.data)
  }
  useEffect(()=>{load()},[id])

  const submit = async () => {
    await axios.post('/api/shared/'+id, form)
    load()
  }
  const del = async (sid) => {
    await axios.delete('/api/shared/'+id+'/'+sid)
    load()
  }

  return <div className="p-6">
    <h1 className="text-xl mb-4">共有リンクページ</h1>
    <input placeholder="名前" value={form.username} onChange={e=>setForm({...form,username:e.target.value})}/>
    <input placeholder="タイトル" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
    <input placeholder="メモ" value={form.memo} onChange={e=>setForm({...form,memo:e.target.value})}/>
    <input type="date" value={form.start_date} onChange={e=>setForm({...form,start_date:e.target.value})}/>
    <input type="date" value={form.end_date} onChange={e=>setForm({...form,end_date:e.target.value})}/>
    <button onClick={submit} className="bg-green-500 text-white px-2 py-1">追加</button>

    <ul>
      {items.map(it=>(<li key={it.id}>
        {it.username} {it.title} {it.memo} ({it.start_date}~{it.end_date})
        <button onClick={()=>del(it.id)} className="text-red-500">削除</button>
      </li>))}
    </ul>
  </div>
}