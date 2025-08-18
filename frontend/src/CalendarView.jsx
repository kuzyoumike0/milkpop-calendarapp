<Calendar
  selectRange={mode === "range"}
  value={mode === "range" ? range : null}
  onClickDay={handleDateClick}
  tileContent={tileContent}
  tileClassName={({ date, view }) => {
    if (view === "month") {
      if (isHoliday(date)) return "holiday";
      if (date.getDay() === 0) return "sunday";
      if (date.getDay() === 6) return "saturday";
      // 複数選択モードのときに選択済み日付を強調
      if (mode === "multi" && multi.some((d) => d.toDateString() === date.toDateString())) {
        return "selected-day";
      }
    }
    return null;
  }}
/>
