import React, { useState } from 'react';
import CalendarForm from './components/CalendarForm';
import CalendarList from './components/CalendarList';
import EventPage from './components/EventPage';

function App() {
  const [refresh, setRefresh] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-10">
      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-6">MilkPop Calendar</h1>
        <CalendarForm onAdd={() => setRefresh(!refresh)} />
        <CalendarList key={refresh} />
        <EventPage />
      </div>
    </div>
  );
}

export default App;
