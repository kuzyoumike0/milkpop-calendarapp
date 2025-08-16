import React from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

export default function App() {
  return (
    <div className="container">
      <h1>Calendar App</h1>
      <Calendar selectRange={true} />
    </div>
  )
}