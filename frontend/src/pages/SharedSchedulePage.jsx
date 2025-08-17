import React, { useState } from 'react'
import CustomCalendar from '../components/CustomCalendar.jsx'

export default function SharedSchedulePage() {
  const [link, setLink] = useState(null)

  const generateLink = () => {
    const id = Math.random().toString(36).substring(2, 9)
    setLink(window.location.origin + "/shared/" + id)
  }

  return (
    <div>
      <h2>共有スケジュール</h2>
      <CustomCalendar />
      <button onClick={generateLink}>共有リンク発行</button>
      {link && <p><a href={link}>{link}</a></p>}
    </div>
  )
}
