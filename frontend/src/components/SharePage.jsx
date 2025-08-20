import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "./Header";
import Footer from "./Footer";
import CalendarWrapper from "./CalendarWrapper";

export default function SharePage() {
  const [schedules, setSchedules] = useState([]);
  const [responses, setResponses] = useState({});
  const [dates, setDates] = useState([]);
  const [rangeMode, setRangeMode] = useState("multiple");

  // 初期データ取得
  useEffect(() => {
    axios.get("/api/shared").then((res) => setSchedules(res.data));
  }, []);

  // プルダウン変更
  const handleChange = (id, value) => {
    setResponses((prev) => ({ ...prev, [id]: value }));
  };

  // 保存処理（カレンダー選択結果を即時反映）
  const handleSave = () => {
    const newEntries = [];
    if (rangeMode === "multiple" && Array.isArray(dates)) {
      dates.forEach((d) => {
        newEntries.push({
          id: `temp-${d}`,
          date: d.toISOString().split("T")[0],
          timeslot: "全日",
        });
      });
    } else if (rangeMode === "range" && Array.isArray(dates)) {
      let current = new Date(dates[0]);
      const end = new Date(dates[1]);
      while (current <= end) {
        newEntries.push({
          id: `temp-${current.toISOString()}`,
          date: current.toISOString().split("T")[0],
          timeslot: "全日",
        });
        current.setDate(current.getDate() + 1);
      }
    }

    // 即時反映（テーブル更新）
    setSchedules((prev) => [...prev, ...newEntries]);

    // サーバー保存
    axios
      .post("/api/shared/responses", { responses, dates })
      .then(() => alert("保存しました！"));
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-6 py-10">
        <h2 className="text-3xl font-extrabold mb-6 text-[#FDB9C8]">
          共有スケジュール
        </h2>

        {/* カレンダー選択 */}
        <div className="mb-6">
          <label className="block mb-2">日程選択</label>
          <CalendarWrapper mode={rangeMode} value={dates} onChange={setDates} />
        </div>

        {/* モード切替 */}
        <div className="mb-6 flex gap-4">
          <label>
            <input
              type="radio"
              name="mode"
              value="range"
              checked={rangeMode === "range"}
              onChange={() => setRangeMode("range")}
            />
            範囲選択
          </label>
          <label>
            <input
              type="radio"
              name="mode"
              value="multiple"
              checked={rangeMode === "multiple"}
              onChange={() => setRangeMode("multiple")}
            />
            複数選択
          </label>
        </div>

        {/* テーブル */}
        {schedules.length === 0 ? (
          <p>まだ共有された日程はありません。</p>
        ) : (
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-[#FDB9C8] text-black">
                <th className="p-2">日付</th>
                <th className="p-2">時間帯</th>
                <th className="p-2">選択</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s) => (
                <tr key={s.id} className="border-b border-gray-700">
                  <td className="p-2">{s.date}</td>
                  <td className="p-2">{s.timeslot}</td>
                  <td className="p-2">
                    <select
                      className="px-3 py-1 rounded-lg text-black"
                      value={responses[s.id] || ""}
                      onChange={(e) => handleChange(s.id, e.target.value)}
                    >
                      <option value="">選択してください</option>
                      <option value="〇">〇</option>
                      <option value="✖">✖</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <button
          onClick={handleSave}
          className="mt-6 px-6 py-3 bg-[#FDB9C8] text-black rounded-2xl font-semibold shadow hover:bg-[#004CA0] hover:text-white transition"
        >
          保存
        </button>
      </main>

      <Footer />
    </div>
  );
}
