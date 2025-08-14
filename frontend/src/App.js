import React from 'react';

const sharedEvents = [
  { id: 1, date: '2025-08-15', time: '全日', title: '共有イベント1' },
  { id: 2, date: '2025-08-15', time: '昼', title: '共有イベント2' },
];

const personalEvents = [
  { id: 1, date: '2025-08-15', time: '夜', title: '個人イベント1' },
];

function App() {
  return (
    <div className="container">
      <h1>Milkpop Calendar</h1>

      <h2>共有カレンダー</h2>
      <ul className="calendar-list">
        {sharedEvents.map(event => (
          <li key={event.id} className="calendar-item" data-time={event.time}>
            {event.date} - {event.time} : {event.title}
          </li>
        ))}
      </ul>

      <h2>個人カレンダー</h2>
      <ul className="calendar-list">
        {personalEvents.map(event => (
          <li key={event.id} className="calendar-item" data-time={event.time}>
            {event.date} - {event.time} : {event.title}
          </li>
        ))}
      </ul>

      <footer>© 2025 Milkpop Calendar</footer>
    </div>
  );
}

export default App;
