import React from 'react';
import CustomCalendar from '../components/CustomCalendar';

export default function PersonalPage() {
  return (
    <div className="page">
      <h2>個人スケジュール</h2>
      <CustomCalendar />
    </div>
  );
}
