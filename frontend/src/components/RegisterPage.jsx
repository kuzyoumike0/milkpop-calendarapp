<main className="register-card">
  {/* 左側カレンダー（7割） */}
  <div className="calendar-section">
    <h2 className="page-title">日程登録</h2>

    {/* タイトル入力 */}
    <div className="title-input-wrapper">
      <input
        type="text"
        placeholder="タイトルを入力"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="input-title short"
      />
    </div>

    {/* 複数/範囲選択 */}
    <div className="radio-group">
      <label>
        <input
          type="radio"
          value="multiple"
          checked={selectionType === "multiple"}
          onChange={(e) => setSelectionType(e.target.value)}
        />
        複数選択
      </label>
      <label>
        <input
          type="radio"
          value="range"
          checked={selectionType === "range"}
          onChange={(e) => setSelectionType(e.target.value)}
        />
        範囲選択
      </label>
    </div>

    {/* ==== カレンダー ==== */}
    <div className="calendar">
      <div className="calendar-header">
        <button type="button" onClick={() =>
          setCurrentMonth((prev) => {
            if (prev === 0) {
              setCurrentYear((y) => y - 1);
              return 11;
            }
            return prev - 1;
          })
        }>←</button>
        <h3 className="month-title">{currentYear}年 {currentMonth + 1}月</h3>
        <button type="button" onClick={() =>
          setCurrentMonth((prev) => {
            if (prev === 11) {
              setCurrentYear((y) => y + 1);
              return 0;
            }
            return prev + 1;
          })
        }>→</button>
      </div>

      <div className="week-header">
        {["日", "月", "火", "水", "木", "金", "土"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {calendarDays.map((date, i) =>
          date ? (
            <CalendarCell
              key={i}
              date={date}
              isSelected={isDateSelected(date)}
              onClick={handleDateClick}
              isHoliday={!!getHolidayInfo(date)}
              holidayName={getHolidayInfo(date)}
              isSaturday={date.getDay() === 6}
              isSunday={date.getDay() === 0}
              isToday={
                date.getFullYear() === today.getFullYear() &&
                date.getMonth() === today.getMonth() &&
                date.getDate() === today.getDate()
              }
            />
          ) : (
            <div key={i}></div>
          )
        )}
      </div>
    </div>
  </div>

  {/* 右側リスト（3割） */}
  <div className="options-section">
    <h3 style={{ color: "#ff69b4" }}>選択した日程</h3>
    <div>
      {selectedDates
        .sort((a, b) => a - b)
        .map((d, i) => (
          <div key={i} className="selected-date">
            {d.toLocaleDateString("ja-JP")}
          </div>
        ))}
    </div>

    <button
      type="submit"
      className="share-button fancy"
      style={{ marginTop: "1rem" }}
      onClick={handleSubmit}
    >
      🌸 共有リンクを発行 🌸
    </button>
  </div>
</main>
