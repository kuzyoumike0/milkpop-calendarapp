import React, {useState} from 'react'
import axios from 'axios'
import CustomCalendar from '../components/CustomCalendar'

export default function SharedCalendar(){
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [rangeStart, setRangeStart] = useState(null)
  const [rangeEnd, setRangeEnd] = useState(null)
  const [title, setTitle] = useState("")
  const [genUrl, setGenUrl] = useState("")

  const onDayClick = (date)=>{
    if(!rangeStart){ setRangeStart(date); setRangeEnd(date); return }
    if(rangeStart && !rangeEnd){
      if(date < rangeStart){ setRangeEnd(rangeStart); setRangeStart(date); }
      else setRangeEnd(date)
      return
    }
    // both set -> restart
    if(date < rangeStart){ setRangeStart(date); setRangeEnd(null); }
    else { setRangeStart(date); setRangeEnd(date); }
  }

  const generateLink = async ()=>{
    if(!rangeStart || !rangeEnd || !title) return alert("タイトルと期間を選択してください")
    const payload = {
      title,
      start_date: rangeStart.toISOString().slice(0,10),
      end_date: rangeEnd.toISOString().slice(0,10)
    }
    await axios.post('/api/schedules', payload)
    const res = await axios.post('/api/shared-link')
    setGenUrl(res.data.link)
  }

  return (
    <section className="glass p-6">
      <h2 className="text-2xl font-bold text-accent mb-4">共有カレンダー</h2>
      <div className="flex flex-wrap gap-6 items-start">
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
          <div className="text-sm text-textSub">
            {rangeStart && rangeEnd ? `選択: ${rangeStart.toLocaleDateString()} 〜 ${rangeEnd.toLocaleDateString()}` : "期間を選択してください"}
          </div>
          <button onClick={generateLink} className="w-full px-4 py-2 rounded-lg bg-accent text-[#121212] font-bold hover:bg-accentSub transition">共有リンクを発行</button>
          {genUrl && (
            <div className="mt-2 text-sm">
              共有URL: <a className="underline text-accent" href={genUrl}>{genUrl}</a>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
