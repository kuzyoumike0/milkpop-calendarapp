<div className="container">
  <h1>共有カレンダー & 個人カレンダー</h1>

  <h2>共有カレンダー</h2>
  <ul className="calendar-list">
    {sharedEvents.map(event => (
      <li key={event.id} className="calendar-item" data-time={event.time}>
        <div>{event.date} - {event.time} : {event.title}</div>
      </li>
    ))}
  </ul>

  <h2>個人カレンダー</h2>
  <ul className="calendar-list">
    {personalEvents.map(event => (
      <li key={event.id} className="calendar-item" data-time={event.time}>
        <div>{event.date} - {event.time} : {event.title}</div>
      </li>
    ))}
  </ul>
</div>
