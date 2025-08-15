import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/events")
      .then(res => setEvents(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1>カレンダー</h1>
      <ul>
        {events.map(e => (
          <li key={e.id}>{e.title} - {e.date}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
