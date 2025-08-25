const renderCalendarDays = () => {
  const days = [];
  const holidays = hd.getHolidays(currentYear);

  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;
    const dateObj = new Date(currentYear, currentMonth, day);
    const weekday = dateObj.getDay();

    // ✅ 祝日検索
    const holiday = holidays.find(
      (h) =>
        h.date ===
        `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(
          day
        ).padStart(2, "0")}`
    );

    let dayClass = "calendar-day";
    if (holiday || weekday === 0) {
      dayClass += " holiday";
    } else if (weekday === 6) {
      dayClass += " saturday";
    }
    if (selectedDates.includes(dateKey)) {
      dayClass += " selected";
    }
    if (
      dateObj.toDateString() ===
      new Date().toDateString()
    ) {
      dayClass += " today"; // ✅ 今日を強調
    }

    days.push(
      <div
        key={day}
        className={dayClass}
        onClick={() => handleDateClick(day)}
      >
        <div className="day-number">{day}</div>
        {holiday && <div className="holiday-name">{holiday.name}</div>}
      </div>
    );
  }
  return days;
};
export default RegisterPage;
