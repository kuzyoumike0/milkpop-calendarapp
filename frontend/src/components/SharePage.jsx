import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../index.css";
import { useParams } from "react-router-dom";
import { getTodayIso } from "../holiday";

const SharePage = () => {
  const { shareId } = useParams();   // URLから取得
  const [schedule, setSchedule] = useState(null);
  const [userName, setUserName] = useState("");
  const [answers, setAnswers] = useState({});
  const [savedResults, setSavedResults] = useState([]);

  const todayIso = getTodayIso();

  // ===== スケジュール読み込み =====
  useEffect(() => {
    if (!shareId) return;

    const loadSchedule = async () => {
      try {
        const res = await fetch(`/api/schedules/${shareId}`);
        if (res.ok) {
          const data = await res.json();
          setSchedule(data);
        } else {
          setSchedule(null);
        }
      } catch (err) {
        console.error("スケジュール取得失敗:", err);
        setSchedule(null);
      }
    };

    const loadResponses = async () => {
      try {
        const res = await fetch(`/api/responses/${shareId}`);
        if (res.ok) {
          const data = await res.json();
          setSavedResults(data);
        }
      } catch (err) {
        console.error("回答取得失敗:", err);
      }
    };

    loadSchedule();
    loadResponses();

    // ユーザー名を保持
    const storedName = localStorage.getItem("userName");
    if (storedName) setUserName(storedName);
  }, [shareId]);

  // ===== 回答変更 =====
  const handleAnswerChange = (date, value) => {
    setAnswers({ ...answers, [date]: value });
  };

  // ===== 保存処理 =====
  const handleSave = async () => {
    if (!userName) {
      alert("ユーザ名を入力してください");
      return;
    }
    if (!schedule) return;

    // 未回答には「-」を入れる
    const finalAnswers = {};
    schedule.dates.forEach((d) => {
      finalAnswers[d.date] = answers[d.date] ? answers[d.date] : "-";
    });

    const res = await fetch("/api/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ share_id: shareId, user_name: userName, answers: finalAnswers }),
    });

    if (res.ok) {
      localStorage.setItem("userName", userName);
      const list = await fetch(`/api/responses/${shareId}`).then((r) => r.json());
      setSavedResults(list);
      setAnswers({});
    } else {
      alert("保存に失敗しました");
    }
  };

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

        {!schedule ? (
          <p>スケジュールが見つかりません</p>
        ) : (
          <div className="register-layout">
            {/* 左: カレンダー & 日程表示 */}
            <div className="calendar-section">
              <div className="custom-calendar">
                <h3 className="text-lg font-bold text-[#004CA0] mb-2">
                  {schedule.title}
                </h3>
                <Calendar
                  value={schedule.dates.map((d) => new Date(d.date))}
                  className="custom-calendar"
                  tileClassName={({ date }) => {
                    const iso = date.toLocaleDateString("sv-SE");
                    let classes = [];
                    if (schedule.dates.find((d) => d.date === iso)) {
                      classes.push("react-calendar__tile--active");
                    }
                    if (iso === todayIso) classes.push("react-calendar__tile--today");
                    return classes.join(" ");
                  }}
                />
              </div>

              <div className="mt-6">
                <h2 className="text-xl font-bold mb-2 text-[#004CA0]">📅 登録日程</h2>
                {schedule.dates.map((d) => (
                  <div key={d.date} className="schedule-card">
                    <span>{d.date}</span>
                    <span className="ml-2 text-sm text-gray-300">
                      {d.type === "時間指定"
                        ? `${d.start}〜${d.end}`
                        : d.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 右: 回答フォーム */}
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

              {schedule.dates.map((d) => (
                <div key={d.date} className="schedule-card">
                  <span>{d.date}</span>
                  <select
                    className="px-2 py-1 rounded text-black"
                    value={answers[d.date] || ""}
                    onChange={(e) => handleAnswerChange(d.date, e.target.value)}
                  >
                    <option value="">選択してください</option>
                    <option value="〇">〇</option>
                    <option value="△">△</option>
                    <option value="✖">✖</option>
                  </select>
                </div>
              ))}

              <div className="mt-6">
                <button
                  onClick={handleSave}
                  className="share-btn"
                >
                  保存する
                </button>
              </div>

              {/* 保存結果一覧 */}
              <div className="mt-6 bg-white text-black p-3 rounded-lg shadow">
                <h3 className="text-lg font-bold mb-2">📋 回答一覧</h3>
                {savedResults.length === 0 && <p>まだ回答はありません</p>}
                {savedResults.map((row, idx) => (
                  <div key={idx} className="mb-4">
                    <p className="font-bold">{row.user_name}</p>
                    {Object.entries(row.answers || {}).map(([date, ans]) => (
                      <p key={date}>
                        {date} : <span className="font-bold">{ans}</span>
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer>
        <p>© 2025 MilkPOP Calendar</p>
      </footer>
    </div>
  );
};

export default SharePage;
