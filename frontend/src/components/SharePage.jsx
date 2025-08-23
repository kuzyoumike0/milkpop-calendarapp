import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../index.css";

const SharePage = () => {
  const [schedule, setSchedule] = useState(null);
  const [userName, setUserName] = useState("");
  const [answers, setAnswers] = useState({});
  const [savedResults, setSavedResults] = useState([]);

  useEffect(() => {
    // 仮データ（API接続予定）
    setSchedule({
      title: "サンプルイベント",
      dates: ["2025-08-23", "2025-08-24", "2025-08-25"],
    });

    // ログイン名を localStorage から取得
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  const handleAnswerChange = (date, value) => {
    setAnswers({
      ...answers,
      [date]: value,
    });
  };

  const handleSave = () => {
    if (!userName) {
      alert("ユーザ名を入力してください");
      return;
    }
    // 保存済みに追加
    const newResult = {
      user: userName,
      answers: { ...answers },
    };
    setSavedResults([...savedResults, newResult]);

    // 名前を保持
    localStorage.setItem("userName", userName);

    // 回答リセット
    setAnswers({});
  };

  // 全て選択されているかチェック
  const allAnswered =
    schedule &&
    schedule.dates.every((date) => answers[date] && answers[date] !== "");

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* ===== バナー ===== */}
      <header className="shadow-lg">
        <h1 className="text-2xl font-bold">MilkPOP Calendar</h1>
        <nav className="nav">
          <a href="/" className="hover:text-[#FDB9C8]">トップ</a>
          <a href="/register" className="hover:text-[#FDB9C8]">日程登録</a>
          <a href="/personal" className="hover:text-[#FDB9C8]">個人スケジュール</a>
        </nav>
      </header>

      <main>
        <h2 className="page-title mt-6">共有ページ</h2>

        {schedule ? (
          <div className="register-layout">
            {/* ===== 左: カレンダー + 日程一覧 ===== */}
            <div className="calendar-section">
              <div className="custom-calendar">
                <h3 className="text-lg font-bold text-[#004CA0] mb-2">
                  {schedule.title}
                </h3>
                <Calendar
                  value={schedule.dates.map((d) => new Date(d))}
                  className="custom-calendar"
                  tileClassName={({ date }) => {
                    if (
                      schedule.dates.find(
                        (d) =>
                          new Date(d).toDateString() === date.toDateString()
                      )
                    ) {
                      return "react-calendar__tile--active";
                    }
                    return null;
                  }}
                />
              </div>

              <div className="mt-6">
                <h2 className="text-xl font-bold mb-2 text-[#004CA0]">📅 日程一覧</h2>
                {schedule.dates.map((date) => (
                  <div key={date} className="schedule-card">
                    <span>{date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ===== 右: 回答フォーム ===== */}
            <div className="schedule-section">
              <h2 className="text-xl font-bold mb-4 text-[#004CA0]">✅ 出欠回答</h2>

              {/* ユーザ名入力 */}
              <div className="mb-4">
                <label className="block mb-1">ユーザ名</label>
                <input
                  type="text"
                  className="title-input w-full text-black"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="あなたの名前"
                />
              </div>

              {schedule.dates.map((date) => (
                <div key={date} className="schedule-card">
                  <span>{date}</span>
                  <select
                    className="px-2 py-1 rounded text-black"
                    value={answers[date] || ""}
                    onChange={(e) => handleAnswerChange(date, e.target.value)}
                  >
                    <option value="">選択してください</option>
                    <option value="〇">〇</option>
                    <option value="▲">▲</option>
                    <option value="✖">✖</option>
                  </select>
                </div>
              ))}

              <div className="mt-6">
                <button
                  onClick={handleSave}
                  className={`share-btn ${!allAnswered ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={!allAnswered}
                >
                  保存する
                </button>
              </div>

              {/* ===== 保存結果一覧 ===== */}
              <div className="mt-6 bg-white text-black p-3 rounded-lg shadow">
                <h3 className="text-lg font-bold mb-2">📋 回答一覧</h3>
                {savedResults.length === 0 && <p>まだ回答はありません</p>}
                {savedResults.map((result, idx) => (
                  <div key={idx} className="mb-2">
                    <p className="font-bold">{result.user}</p>
                    <ul className="ml-4 list-disc">
                      {Object.entries(result.answers).map(([date, ans]) => (
                        <li key={date}>
                          {date} : <span className="font-bold">{ans}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p>読み込み中...</p>
        )}
      </main>

      <footer>
        <p>© 2025 MilkPOP Calendar</p>
      </footer>
    </div>
  );
};

export default SharePage;
