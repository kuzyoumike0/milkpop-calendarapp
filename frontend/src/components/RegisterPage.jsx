// frontend/src/components/SharePage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const SharePage = () => {
  const { id } = useParams(); // URLの :id を取得
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await fetch(`/api/schedules/share/${id}`);
        if (!response.ok) throw new Error("データ取得に失敗しました");
        const data = await response.json();
        setSchedules(data);
      } catch (error) {
        console.error("エラー:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* バナー */}
      <header className="bg-[#FDB9C8] text-[#004CA0] p-4 text-2xl font-bold text-center rounded-2xl shadow-md flex justify-between">
        <span>MilkPOP Calendar</span>
        <nav className="space-x-4">
          <a href="/" className="hover:underline">トップ</a>
          <a href="/personal" className="hover:underline">個人スケジュール</a>
          <a href="/register" className="hover:underline">日程登録</a>
        </nav>
      </header>

      {/* タイトル */}
      <h1 className="text-3xl font-bold my-6 text-center">共有スケジュール</h1>

      {/* スケジュール一覧 */}
      {schedules.length === 0 ? (
        <p className="text-center text-gray-400">スケジュールがありません。</p>
      ) : (
        <ul className="space-y-4 max-w-2xl mx-auto">
          {schedules.map((schedule) => (
            <li
              key={schedule.id}
              className="p-4 rounded-2xl shadow bg-[#004CA0] text-white"
            >
              <h2 className="text-xl font-semibold">{schedule.title}</h2>
              <p className="mt-1 text-sm text-gray-200">
                {new Date(schedule.start).toLocaleString()} -{" "}
                {new Date(schedule.end).toLocaleString()}
              </p>
              {schedule.memo && (
                <p className="mt-2 text-gray-100">メモ: {schedule.memo}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SharePage;
