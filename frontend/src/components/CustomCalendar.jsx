import React, {useMemo} from 'react'

function daysInMonth(year, month){ // month: 0-11
  return new Date(year, month+1, 0).getDate()
}

export default function CustomCalendar({year, month, rangeStart, rangeEnd, onDayClick}){
  const firstDay = new Date(year, month, 1).getDay()
  const total = daysInMonth(year, month)
  const cells = useMemo(()=>{
    const arr = []
    for(let i=0;i<firstDay;i++) arr.push(null)
    for(let d=1; d<=total; d++) arr.push(new Date(year, month, d))
    while(arr.length % 7 !== 0) arr.push(null)
    return arr
  }, [year, month, firstDay, total])

  const inRange = (date)=>{
    if(!date || !rangeStart || !rangeEnd) return false
    const t = date.setHours(0,0,0,0)
    return t >= rangeStart.setHours(0,0,0,0) && t <= rangeEnd.setHours(0,0,0,0)
  }

  return (
    <div className="glass p-4">
      <div className="grid grid-cols-7 gap-1 text-center mb-2 text-textSub text-xs">
        {['日','月','火','水','木','金','土'].map((w)=>(<div key={w} className="py-1">{w}</div>))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i)=>(
          <button
            key={i}
            onClick={()=> date && onDayClick(date)}
            className={
              "h-10 rounded-md text-sm transition " +
              (date ? (inRange(date) ? "bg-accent text-[#121212] font-bold" : "hover:bg-white/10") : "opacity-0 pointer-events-none")
            }>
            {date ? date.getDate() : ""}
          </button>
        ))}
      </div>
    </div>
  )
}
