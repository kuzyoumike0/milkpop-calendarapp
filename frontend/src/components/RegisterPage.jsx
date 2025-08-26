<div className="register-page">
  <h2 className="page-title">📌 日程登録ページ</h2>

  {/* タイトル入力 */}
  <div className="title-input-container">
    <input
      type="text"
      className="title-input"
      placeholder="イベントのタイトルを入力"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
    />
  </div>

  {/* カレンダー + 選択リスト 横並び */}
  <div className="calendar-container">
    <div className="calendar-box">
      <Calendar
        onClickDay={handleDateClick}
        tileClassName={({ date }) => {
          const dateStr = date.toISOString().split("T")[0];
          if (selectedDates.includes(dateStr)) {
            return "selected-day";
          }
          if (hd.isHoliday(date)) {
            return "holiday";
          }
          return null;
        }}
      />
    </div>

    <div className="selected-dates">
      <h3>📅 選択した日程</h3>
      <ul>
        {selectedDates
          .sort((a, b) => new Date(a) - new Date(b))
          .map((date) => (
            <li key={date} className="date-item">
              <span className="date-text">{formatDate(date)}</span>

              {/* ▼ 時間帯セレクト */}
              <select
                className="time-select"
                value={timeSelections[date] || "all"}
                onChange={(e) => handleTimeChange(date, e.target.value)}
              >
                <option value="all">終日 (0:00〜24:00)</option>
                <option value="day">昼 (9:00〜17:00)</option>
                <option value="night">夜 (18:00〜24:00)</option>
                <option value="custom">時間指定</option>
              </select>

              {/* ▼ custom のときだけ表示 */}
              {timeSelections[date] === "custom" && (
                <div className="custom-time">
                  <select
                    className="time-dropdown"
                    onChange={(e) =>
                      handleCustomStartChange(date, e.target.value)
                    }
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {i}:00
                      </option>
                    ))}
                  </select>
                  <span> ~ </span>
                  <select
                    className="time-dropdown"
                    onChange={(e) =>
                      handleCustomEndChange(date, e.target.value)
                    }
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i + 1}>
                        {i + 1}:00
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </li>
          ))}
      </ul>
    </div>
  </div>

  {/* 共有リンク発行 */}
  <div className="share-link-container">
    <button className="share-link-btn">✨ 共有リンクを発行</button>
  </div>
</div>
