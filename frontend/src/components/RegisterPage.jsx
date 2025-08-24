// 中略 … import 部分・ヘルパー関数はそのまま

const CalendarCell = ({ date, isSelected, onClick, isHoliday, holidayName, isSaturday, isSunday }) => {
  let textColor = "";
  if (isHoliday) {
    textColor = "text-red-500 font-bold"; // 祝日優先
  } else if (isSunday) {
    textColor = "text-red-500 font-bold";
  } else if (isSaturday) {
    textColor = "text-blue-500 font-bold";
  }

  return (
    <div
      onClick={() => onClick(date)}
      title={holidayName || ""}
      className={`w-16 h-16 sm:w-14 sm:h-14 flex flex-col items-center justify-center rounded-lg cursor-pointer transition
        ${isSelected ? "bg-[#FDB9C8] text-white font-bold" : ""}
        ${textColor}
        ${!isSelected && !isHoliday && !isSaturday && !isSunday ? "hover:bg-[#004CA0] hover:text-white" : ""}`}
    >
      <span className="text-base sm:text-sm">{date.getDate()}</span>
      {holidayName && (
        <span className="text-[0.55rem] sm:text-[0.5rem] text-red-500 font-normal leading-tight text-center">
          {holidayName}
        </span>
      )}
    </div>
  );
};

export default function RegisterPage() {
  // 中略 … state, hooks, handleSubmit はそのまま

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-[#FDB9C8] to-[#004CA0] text-white">
      <header className="w-full bg-black bg-opacity-70 py-4 px-6 flex justify-between items-center shadow-lg">
        <h1 className="text-2xl font-bold">MilkPOP Calendar</h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-5xl p-4 sm:p-6">
        <div className="bg-black bg-opacity-50 rounded-2xl shadow-xl p-4 sm:p-6 w-full">
          <h2 className="text-xl font-semibold mb-4 text-center">日程登録</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* タイトル */}
            <input
              type="text"
              placeholder="タイトルを入力"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-black"
            />

            {/* 複数 / 範囲選択 */}
            <div className="flex space-x-6 items-center justify-center">
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
            <div className="bg-white text-black rounded-xl p-4 shadow-md overflow-x-auto">
              <div className="flex justify-between items-center mb-2">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentMonth((prev) => {
                      if (prev === 0) {
                        setCurrentYear((y) => y - 1);
                        return 11;
                      }
                      return prev - 1;
                    })
                  }
                  className="px-2 py-1 bg-gray-200 rounded"
                >
                  ←
                </button>
                <h3 className="font-bold text-lg sm:text-base">
                  {currentYear}年 {currentMonth + 1}月
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentMonth((prev) => {
                      if (prev === 11) {
                        setCurrentYear((y) => y + 1);
                        return 0;
                      }
                      return prev + 1;
                    })
                  }
                  className="px-2 py-1 bg-gray-200 rounded"
                >
                  →
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2 sm:gap-1 font-semibold text-center text-sm">
                {["日", "月", "火", "水", "木", "金", "土"].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2 sm:gap-1 mt-2">
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
                    />
                  ) : (
                    <div key={i} className="w-16 h-16 sm:w-14 sm:h-14"></div>
                  )
                )}
              </div>
            </div>

            {/* ==== 時間帯 ==== */}
            <div className="bg-white text-black rounded-xl p-4 shadow-md space-y-2">
              <p className="font-semibold">時間帯を選択してください:</p>
              <div className="flex flex-col space-y-1">
                <label>
                  <input
                    type="radio"
                    value="allday"
                    checked={timeType === "allday"}
                    onChange={(e) => setTimeType(e.target.value)}
                  />
                  全日
                </label>
                <label>
                  <input
                    type="radio"
                    value="daytime"
                    checked={timeType === "daytime"}
                    onChange={(e) => setTimeType(e.target.value)}
                  />
                  昼（09:00〜18:00）
                </label>
                <label>
                  <input
                    type="radio"
                    value="night"
                    checked={timeType === "night"}
                    onChange={(e) => setTimeType(e.target.value)}
                  />
                  夜（18:00〜23:59）
                </label>
                <label>
                  <input
                    type="radio"
                    value="custom"
                    checked={timeType === "custom"}
                    onChange={(e) => setTimeType(e.target.value)}
                  />
                  時刻指定
                </label>
              </div>

              {timeType === "custom" && (
                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="time"
                    value={timeRange.start}
                    onChange={(e) =>
                      setTimeRange({ ...timeRange, start: e.target.value })
                    }
                    className="border rounded px-2 py-1"
                  />
                  <span>〜</span>
                  <input
                    type="time"
                    value={timeRange.end}
                    onChange={(e) =>
                      setTimeRange({ ...timeRange, end: e.target.value })
                    }
                    className="border rounded px-2 py-1"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-[#FDB9C8] hover:bg-[#e89cab] text-black font-bold"
            >
              共有リンクを発行
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
