// frontend/src/components/PersonalPage.jsx
import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "../index.css";

const PersonalPage = () => {
  const [user, setUser] = useState(null);
  const [schedule, setSchedule] = useState(null);

  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          setUser(data.user);
          fetch("/api/myschedule", { credentials: "include" })
            .then(res => res.json())
            .then(s => setSchedule(s.schedule));
        }
      });
  }, []);

  if (!user) {
    return <p>Discordでログインしてください。</p>;
  }

  const tileClassName = ({ date }) => {
    if (
      schedule?.selectedDates?.some(
        (d) => new Date(d).toDateString() === date.toDateString()
      )
    ) {
      return "selected-date";
    }
    return null;
  };

  return (
    <div className="page-container">
      <h2 className="page-title">個人スケジュール</h2>
      <p>👤 {user.username}</p>

      <div className="register-layout">
        <div className="calendar-section">
          <Calendar tileClassName={tileClassName} />
        </div>
        <div className="schedule-section">
          <h3>保存した日程</h3>
          {schedule?.selectedDates?.map((d, i) => {
            const dateStr = new Date(d).toDateString();
            const option =
              schedule.dateOptions?.[dateStr] || {
                type: "終日",
                start: "0:00",
                end: "23:00",
              };

            return (
              <li key={i}>
                <strong>{new Date(d).toLocaleDateString()}</strong>
                <span> - 区分: {option.type}</span>
                {option.type === "時刻指定" && (
                  <span> ({option.start}〜{option.end})</span>
                )}
              </li>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PersonalPage;
