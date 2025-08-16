import React, { useState } from 'react'
import PersonalCalendar from './components/PersonalCalendar.jsx'
import SharedCalendar from './components/SharedCalendar.jsx'

export default function App() {
  const [view, setView] = useState('personal')
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📅 カレンダーアプリ</h1>
      <div className="mb-4">
        <button onClick={() => setView('personal')} className="px-4 py-2 mr-2 bg-blue-500 text-white rounded">
          個人スケジュール
        </button>
        <button onClick={() => setView('shared')} className="px-4 py-2 bg-green-500 text-white rounded">
          共有スケジュール
        </button>
      </div>
      {view === 'personal' ? <PersonalCalendar /> : <SharedCalendar />}
    </div>
  )
}
