import React, { useState } from 'react';
import CalendarForm from './components/CalendarForm';
import CalendarList from './components/CalendarList';

function App() {
  const [refresh, setRefresh] = useState(0);

  const handleAdded = () => setRefresh(prev => prev + 1);

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-10">
      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-6">MilkPop Calendar</h1>
        <CalendarForm onAdded={handleAdded} />
        <CalendarList refresh={refresh} />
      </div>
    </div>
  );
}

export default App;
