import React, { useState } from 'react'
import { DateRange } from 'react-date-range'
import axios from 'axios'

export default function PersonalCalendar() {
  const [range, setRange] = useState([{ startDate: new Date(), endDate: new Date(), key: 'selection' }])
  const [time, setTime] = useState('全日')
  const [memo, setMemo] = useState('')

  const saveEvent = async () => {
    await axios.post('/api/personal/demoUser', {
      start: range[0].startDate,
      end: range[0].endDate,
      time,
      memo,
    })
    alert('保存しました！')
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">個人スケジュール</h2>
      <DateRange editableDateInputs={true} onChange={item => setRange([item.selection])} moveRangeOnFirstSelection={false} ranges={range} />
      <div className="mt-4">
        <select value={time} onChange={e => setTime(e.target.value)} className="border p-2 mr-2">
          <option>全日</option>
          <option>昼</option>
          <option>夜</option>
        </select>
        <input type="text" value={memo} onChange={e => setMemo(e.target.value)} placeholder="メモを入力" className="border p-2 mr-2" />
        <button onClick={saveEvent} className="px-4 py-2 bg-blue-500 text-white rounded">保存</button>
      </div>
    </div>
  )
}
