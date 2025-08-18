import React, {useState} from 'react'
import CustomCalendar from '../components/CustomCalendar'
import axios from 'axios'

export default function PersonalSchedule(){
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [rangeStart, setRangeStart] = useState(null)
  const [rangeEnd, setRangeEnd] = useState(null)
  const [title, setTitle] = useState("")
  const [memo, setMemo] = useState("")

  const onDayClick = (date)=>{
    if(!rangeStart){ setRangeStart(date); setRangeEnd(date); return }
    if(rangeStart && !rangeEnd){
      if(date < rangeStart){ setRangeEnd(rangeStart); setRangeStart(date); }
      else setRangeEnd(date)
      return
    }
    if(date < rangeStart){ setRangeStart(date); setRangeEnd(null); }
    else { setRangeStart(date); setRangeEnd(date); }
  }

  const save = async ()=>{
    if(!title || !rangeStart || !rangeEnd) return alert("タイトルと期間を入力してください")
    await axios.post('/api/schedules', {
      title, memo,
      start_date: rangeStart.toISOString().slice(0,10),
      end_date: rangeEnd.toISOString().slice(0,10)
    })
    setTitle(""); setMemo(""); setRangeStart(null); setRangeEnd(null)
    alert("保存しました")
  }

  return (
    <section className="glass p-6">
      <h2 className="text-2xl font-bold text-accent mb-4">個人スケジュール</h2>
      <div className="flex flex-wrap items-start gap-6">
        <div className="space-y-3">
          <div className="flex gap-2">
            <button onClick={()=> setMonth(m=> (m+11)%12)} className="px-3 py-2 border border-white/10 rounded">←</button>
            <div className="px-4 py-2">{year}年 {month+1}月</div>
            <button onClick={()=> setMonth(m=> (m+1)%12)} className="px-3 py-2 border border-white/10 rounded">→</button>
          </div>
          <CustomCalendar year={year} month={month} rangeStart={rangeStart} rangeEnd={rangeEnd} onDayClick={onDayClick} />
        </div>
        <div className="min-w-[280px] space-y-3">
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="タイトル" className="w-full px-3 py-2 rounded bg-transparent border border-white/10 focus:border-accentSub outline-none"/>
          <textarea value={memo} onChange={e=>setMemo(e.target.value)} placeholder="メモ（任意）" className="w-full px-3 py-2 rounded bg-transparent border border-white/10 focus:border-accentSub outline-none"/>
          <div className="text-sm text-textSub">
            {rangeStart && rangeEnd ? `選択: ${rangeStart.toLocaleDateString()} 〜 ${rangeEnd.toLocaleDateString()}` : "期間を選択してください"}
          </div>
          <button onClick={save} className="w-full px-4 py-2 rounded-lg bg-accent text-[#121212] font-bold hover:bg-accentSub transition">保存</button>
        </div>
      </div>
    </section>
  )
}
