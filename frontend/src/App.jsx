import React from 'react';
import CalendarForm from './components/CalendarForm';
import CalendarList from './components/CalendarList';
import SharedSchedule from './components/SharedSchedule';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-10">
      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-6">MilkPop Calendar</h1>
        <CalendarForm />
        <CalendarList />
        <SharedSchedule />
      </div>
    </div>
  );
}
