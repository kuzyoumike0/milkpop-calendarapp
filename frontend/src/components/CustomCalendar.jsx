import React, { useState } from 'react'

export default function CustomCalendar() {
  const today = new Date()
  const [selected, setSelected] = useState(null)

  const days = []
  for (let i = 1; i <= 30; i++) {
    days.push(i)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
      {days.map(day => (
        <div
          key={day}
          onClick={() => setSelected(day)}
          style={{
            padding: '10px',
            textAlign: 'center',
            cursor: 'pointer',
            borderRadius: '8px',
            background: selected === day ? '#FDB9C8' : '#eee',
            border: today.getDate() === day ? '2px solid #004CA0' : '1px solid #ccc'
          }}
        >
          {day}
        </div>
      ))}
    </div>
  )
}
