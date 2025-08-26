import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import Holidays from "date-holidays";
import "react-calendar/dist/Calendar.css";
import "../common.css";
import "../register.css";

const hd = new Holidays("JP"); // 日本の祝日

const RegisterPage = () => {
  const [value, setValue] = useState(new Date());
  const [holidays, setHolidays] = useState({});

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const holidayList = hd.getHolidays(currentYear);
    const holidayMap = {};
    holidayList.forEach((h) => {
      holidayMap[new Date(h.date).toDateString()] = h.name;
    });
    setHolidays(holidayMap);
  }, []);

  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const holidayName = holidays[date.toDateString()];
      if (holidayName) {
        return (
          <div className="holiday-name">
            {holidayName}
          </div>
        );
      }
    }
    return null;
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const isSunday = date.getDay() === 0;
      const isHoliday = holidays[date.toDateString()];
      if (isHoliday || isSunday) {
        return "holiday";
      }
      if (date.getDay() === 6) {
        return "saturday";
      }
    }
    return null;
  };

  return (
    <div className="register-page">
      <h2>日程登録ページ</h2>
      <div className="calendar-container">
        <Calendar
          onChange={setValue}
          value={value}
          locale="ja-JP"
          calendarType="gregory"
          tileContent={tileContent}
          tileClassName={tileClassName}
        />
      </div>
    </div>
  );
};

export default RegisterPage;
