import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const SharePage = () => {
  const { shareId } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [responses, setResponses] = useState({});
  const [userName, setUserName] = useState("");
  const [highlightDates, setHighlightDates] = useState([]);

  const hours = [...Array(24).keys()].map((h) =>
    String(h).padStart(2, "0") + ":00"
  );

  // ===== データ取得 =====
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await fetch(`/api/share/${shareId}`);
        const data = await res.json();

        // 日付順にソート
        const sorted = data.sort((a, b) => new Date(a.date) - new Date(b.date));
        setSchedules(sorted);

        // ハイライトする日付一覧
        setHighlightDates(sorted.map((s) => s.date));
      } catch (err) {
        console.error("Error fetching schedules:", err);
      }
    };
    fetchSchedules();
  }, [shareId]);

  // ===== 選択 =====
  const handleSelect = (scheduleId, field, value) => {
    setResponses((prev) => ({
      ...prev,
      [scheduleId]: {
        ...prev[scheduleId],
        [field]: value,
      },
    }));
  };

  // ===== 保存 =====
  const handleSave = async () => {
    if (!userName.trim()) {
      alert("名前を入力してください");
      return;
    }
    try {
      await fetch(`/api/share/${shareId}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userName,
          responses,
        }),
      });

      alert("保存しました！");
    } catch (err) {
      console.error("Error saving responses:", err);
      alert("エラーが発生しました");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF0F5] text-black font-sans">
      {/* ===== バナー ===== */}
      <header className="bg-[#004CA0] text-white py-4 shadow-md flex justify-between items-center px-6">
        <h1 className="text-2xl font-bold">MilkPOP Calendar</h1>
        <nav className="space-x-4">
          <Link
            to="/register"
            className="px-3 py-2 rounded-lg bg-[#FDB9C8] text-black font-semibold hover:opacity-80"
          >
            日程登録ページ
          </Link>
          <Link
            to="/personal"
            className="px-3 py-2 rounded-lg bg-[#FDB9C8] text-black font-semibold hover:opacity-80"
          >
            個人スケジュール
          </Link>
        </nav>
      </header>

      {/* ===== 本体: 左カレンダー + 右リスト ===== */}
      <main className="max-w-6xl mx-auto p-6 mt-20">
        <h2 className="text-xl font-bold mb-6 text-[#FDB9C8]">共有スケジュール</h2>

        <div className="register-layout">
          {/* 左：カレンダー */}
          <div className="calendar-section">
            <Calendar
              tileClassName={({ date }) => {
                const dateStr = date.toISOString().split("T")[0];
                return highlightDates.includes(dateStr)
                  ? "today-highlight"
                  : null;
              }}
            />
          </div>

          {/* 右：リスト */}
          <div className="schedule-section">
            {/* 名前入力 */}
            <div className="mb-6">
              <label className="block mb-2 text-gray-700">あなたの名前：</label>
              <input
                type="text"
                className="w-full p-3 rounded-lg border border-gray-300"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="例: 山田太郎"
              />
            </div>

            {/* スケジュール一覧 */}
            <div className="space-y-4">
              {schedules.map((schedule) => {
                const response = responses[schedule.id] || {};
                return (
                  <div
                    key={schedule.id}
                    className="schedule-item flex flex-col gap-2"
                  >
                    <div>
                      <p className="font-semibold text-lg text-[#004CA0]">
                        {schedule.title || "タイトルなし"}
                      </p>
                      <p className="text-gray-600">
                        {new Date(schedule.date).toLocaleDateString("ja-JP")}
                      </p>
                    </div>

                    {/* 時間帯選択 */}
                    <div className="flex items-center gap-2">
                      <select
                        className="vote-select"
                        value={response.timeType || ""}
                        onChange={(e) =>
                          handleSelect(schedule.id, "timeType", e.target.value)
                        }
                      >
                        <option value="">選択してください</option>
                        <option value="all">終日</option>
                        <option value="morning">午前</option>
                        <option value="afternoon">午後</option>
                        <option value="custom">時間指定</option>
                      </select>

                      {/* 時間指定プルダウン */}
                      {response.timeType === "custom" && (
                        <>
                          <select
                            className="vote-select"
                            value={response.startTime || ""}
                            onChange={(e) =>
                              handleSelect(schedule.id, "startTime", e.target.value)
                            }
                          >
                            <option value="">開始時刻</option>
                            {hours.map((h) => (
                              <option key={h} value={h}>
                                {h}
                              </option>
                            ))}
                          </select>

                          <select
                            className="vote-select"
                            value={response.endTime || ""}
                            onChange={(e) =>
                              handleSelect(schedule.id, "endTime", e.target.value)
                            }
                          >
                            <option value="">終了時刻</option>
                            {hours
                              .filter(
                                (h) =>
                                  !response.startTime || h > response.startTime
                              )
                              .map((h) => (
                                <option key={h} value={h}>
                                  {h}
                                </option>
                              ))}
                          </select>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 保存ボタン */}
            <div className="mt-8 text-center">
              <button onClick={handleSave} className="submit-btn">
                保存
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SharePage;
