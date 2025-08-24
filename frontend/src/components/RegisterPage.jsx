<main className="register-card">
  {/* 左側（カレンダー） */}
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
        <button
          type="button"
          className="nav-button"
          onClick={() =>
            setCurrentMonth((prev) => {
              if (prev === 0) {
                setCurrentYear((y) => y - 1);
                return 11;
              }
              return prev - 1;
            })
          }
        >
          ←
        </button>
        <h3 className="month-title">
          {currentYear}年 {currentMonth + 1}月
        </h3>
        <button
          type="button"
          className="nav-button"
          onClick={() =>
            setCurrentMonth((prev) => {
              if (prev === 11) {
                setCurrentYear((y) => y + 1);
                return 0;
              }
              return prev + 1;
            })
          }
        >
          →
        </button>
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

  {/* 右側（選択日リスト + プルダウン） */}
  <div className="options-section">
    <h3 style={{ color: "#ff69b4" }}>選択した日程</h3>
    <div>
      {/* 複数選択モード */}
      {selectionType === "multiple" &&
        selectedDates
          .sort((a, b) => a - b)
          .map((d, i) => {
            const key = d.toISOString().split("T")[0];
            const dt = dateTimes[key] || {
              type: "allday",
              start: 9,
              end: 18,
            };
            return (
              <div key={i} className="selected-date">
                <span>{d.toLocaleDateString("ja-JP")}</span>
                <select
                  value={dt.type}
                  onChange={(e) =>
                    handleTimeChange(key, "type", e.target.value)
                  }
                >
                  {timeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                {dt.type === "custom" && (
                  <>
                    <select
                      value={dt.start}
                      onChange={(e) =>
                        handleTimeChange(key, "start", Number(e.target.value))
                      }
                    >
                      {hours.map((h) => (
                        <option key={h} value={h}>
                          {h}時
                        </option>
                      ))}
                    </select>
                    〜
                    <select
                      value={dt.end}
                      onChange={(e) =>
                        handleTimeChange(key, "end", Number(e.target.value))
                      }
                    >
                      {hours.map((h) => (
                        <option key={h} value={h}>
                          {h}時
                        </option>
                      ))}
                    </select>
                  </>
                )}

                <button
                  className="remove-date-btn"
                  onClick={() => handleRemoveDate(d)}
                >
                  ×
                </button>
              </div>
            );
          })}

      {/* 範囲選択モード */}
      {selectionType === "range" && range.start && range.end && (
        <div className="selected-date">
          <span>
            {range.start.toLocaleDateString("ja-JP")} 〜{" "}
            {range.end.toLocaleDateString("ja-JP")}
          </span>
          <select
            value={rangeTime.type}
            onChange={(e) => handleRangeTimeChange("type", e.target.value)}
          >
            {timeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {rangeTime.type === "custom" && (
            <>
              <select
                value={rangeTime.start}
                onChange={(e) =>
                  handleRangeTimeChange("start", Number(e.target.value))
                }
              >
                {hours.map((h) => (
                  <option key={h} value={h}>
                    {h}時
                  </option>
                ))}
              </select>
              〜
              <select
                value={rangeTime.end}
                onChange={(e) =>
                  handleRangeTimeChange("end", Number(e.target.value))
                }
              >
                {hours.map((h) => (
                  <option key={h} value={h}>
                    {h}時
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      )}
    </div>

    <button
      type="submit"
      className="share-button"
      style={{ marginTop: "1rem" }}
      onClick={handleSubmit}
    >
      共有リンクを発行
    </button>
  </div>
</main>
