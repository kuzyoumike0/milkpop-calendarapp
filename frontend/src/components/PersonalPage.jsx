{/* 時間帯選択 */}
<div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6 mb-6">
  <h2 className="text-xl font-semibold text-[#FDB9C8] mb-3">時間帯</h2>
  <p className="text-gray-400 mb-2">予定の時間帯を選択してください</p>
  <select
    value={timeslot}
    onChange={(e) => setTimeslot(e.target.value)}
    className="w-full p-3 rounded-xl border border-gray-600 bg-black text-white focus:ring-2 focus:ring-[#FDB9C8]"
  >
    <option value="">選択してください</option>
    <option value="終日">終日</option>
    <option value="昼">昼</option>
    <option value="夜">夜</option>
    {Array.from({ length: 24 }).map((_, i) => {
      const hour = (i + 1) % 24;
      return (
        <option key={hour} value={`${hour}:00`}>
          {hour}:00
        </option>
      );
    })}
  </select>
</div>

{/* 開始時刻 / 終了時刻 */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
  <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6">
    <h2 className="text-lg font-semibold text-[#FDB9C8] mb-2">開始時刻</h2>
    <select
      value={startTime}
      onChange={(e) => setStartTime(e.target.value)}
      className="w-full p-3 rounded-xl border border-gray-600 bg-black text-white focus:ring-2 focus:ring-[#FDB9C8]"
    >
      {Array.from({ length: 24 }).map((_, i) => {
        const hour = (i + 1) % 24;
        return (
          <option key={hour} value={`${hour}:00`}>
            {hour}:00
          </option>
        );
      })}
    </select>
  </div>

  <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6">
    <h2 className="text-lg font-semibold text-[#FDB9C8] mb-2">終了時刻</h2>
    <select
      value={endTime}
      onChange={(e) => setEndTime(e.target.value)}
      className="w-full p-3 rounded-xl border border-gray-600 bg-black text-white focus:ring-2 focus:ring-[#FDB9C8]"
    >
      {Array.from({ length: 24 }).map((_, i) => {
        const hour = (i + 1) % 24;
        return (
          <option key={hour} value={`${hour}:00`}>
            {hour}:00
          </option>
        );
      })}
    </select>
  </div>
</div>
