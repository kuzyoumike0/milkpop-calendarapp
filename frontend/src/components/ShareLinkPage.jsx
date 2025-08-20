import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function ShareLinkPage() {
  const { linkId } = useParams(); // ← URLから linkId を取得
  const [schedules, setSchedules] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);

  // 📌 初期ロード
  useEffect(() => {
    if (!linkId) return;
    axios
      .get(`/api/schedules/${linkId}`)
      .then((res) => {
        setSchedules(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => console.error("スケジュール取得エラー:", err));
  }, [linkId]);

  const handleDateChange = (value) => {
    if (Array.isArray(value)) {
      setSelectedDates(value.map((d) => d.toISOString().split("T")[0]));
    } else {
      setSelectedDates([value.toISOString().split("T")[0]]);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <header className="text-center text-3xl font-bold text-[#FDB9C8] mb-6">
        MilkPOP Calendar - 共有スケジュール
      </header>

      <div className="max-w-4xl mx-auto bg-[#004CA0] p-6 rounded-2xl shadow-lg space-y-6">
        {/* カレンダー */}
        <div className="bg-white rounded-xl p-4">
          <Calendar selectRange onChange={handleDateChange} />
        </div>

        {/* 選択した日程の即時表示 */}
        <div className="bg-gray-800 p-4 rounded-xl">
          <h2 className="font-bold mb-2">選択した日程</h2>
          {selectedDates.length > 0 ? (
            <ul className="list-disc list-inside">
              {selectedDates.map((d, idx) => (
                <li key={idx}>{d}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">まだ日程が選択されていません</p>
          )}
        </div>

        {/* 保存済みの共有スケジュール表示 */}
        <div className="bg-gray-900 p-4 rounded-xl">
          <h2 className="font-bold mb-2">保存済みスケジュール</h2>
          {schedules.length > 0 ? (
            <table className="w-full border border-gray-600">
              <thead>
                <tr className="bg-gray-700">
                  <th className="p-2 border border-gray-600">日付</th>
                  <th className="p-2 border border-gray-600">時間帯</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => (
                  <tr key={s.id} className="text-center">
                    <td className="p-2 border border-gray-600">{s.date}</td>
                    <td className="p-2 border border-gray-600">{s.timeslot}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-400">保存されたスケジュールはありません</p>
          )}
        </div>
      </div>
    </div>
  );
}
