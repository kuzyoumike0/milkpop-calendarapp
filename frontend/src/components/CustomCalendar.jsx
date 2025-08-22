import React from "react";
import Calendar from "react-calendar";
import Holidays from "date-holidays";
import "react-calendar/dist/Calendar.css";
import "../index.css";

const hd = new Holidays("JP");

const CustomCalendar = ({ selectedDates, onDateClick, rangeStart }) => {
  // 🎨 祝日 & 選択日のスタイル
  const tileClassName = ({ date }) => {
    if (hd.isHoliday(date)) {
      return "holiday-tile";
    }
    if (selectedDates.some((d) => d.toDateString() === date.toDateString())) {
      return "selected-tile";
    }
    return null;
  };

  return (
    <div className="calendar-wrapper">
      <Calendar
        onClickDay={onDateClick}
        tileClassName={tileClassName}
        locale="ja-JP"
      />
    </div>
  );
};

export default CustomCalendar;
