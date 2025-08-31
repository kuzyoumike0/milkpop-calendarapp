import React, { useMemo, useState } from "react";
import Holidays from "date-holidays";
import "../personal.css"; // ← ご提示のCSSを読み込み

export default function PersonalPage() {
  // ====== 画面状態 ======
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");

  // カレンダー：表示中の年月（1日は固定）
  const [current, setCurrent] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  // 単日選択（スクショ準拠）
  const [selectedDate, setSelectedDate] = useState(null); // "YYYY-MM-DD"

  // 登録済み予定（ローカル反映）
  const [schedules, setSchedules] = useState([]);

  // 祝日（日本）
  const hd = useMemo(() => new Holidays("JP"), []);

  // ====== 日付ユーティリティ ======
  const y = current.getFullYear();
  const m = current.getMonth(); // 0-11
  const todayStr = new Date().toISOString().split("T")[0];

  const pad2 = (n) => String(n).padStart(2, "0");
  const ymdd = (Y, M, D) => `${Y}-${pad2(M + 1)}-${pad2(D)}`;

  const firstWeekday = new Date(y, m, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(y, m + 1, 0).getDate();

  // 曜日ヘッダ
  const weekLabels = ["日", "月", "火", "水", "木", "金", "土"];

  // 祝日名
  const holidayName = (Y, M, D) => {
    const info = hd.isHoliday(new Date(Y, M, D));
    return info ? info[0]?.name : null;
  };

  // クラス判定
  const isToday = (Y, M, D) => ymdd(Y, M, D) === todayStr;
  const isSelected = (Y, M, D) => selectedDate === ymdd(Y, M, D);
  const weekdayClass = (w) => (w === 0 ? "sunday" : w === 6 ? "saturday" : "");

  // クリック
  const onClickCell = (Y, M, D) => {
    const dateStr = ymdd(Y, M, D);
    setSelectedDate(dateStr);
  };

  // 月移動
  const prevMonth = () => setCurrent(new Date(y, m - 1, 1));
  const nextMonth = () => setCurrent(new Date(y, m + 1, 1));

  // カレンダーマトリクス生成（null は先頭空白）
  const matrix = (() => {
    const cells = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const rows = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  })();

  // 登録
  const handleRegister = () => {
    if (!title.trim() || !selectedDate) return;
    const item = {
      id: `${selectedDate}-${Date.now()}`,
      date: selectedDate,
      title: title.trim(),
      memo: memo.trim(),
    };
    const next = [...schedules, item].sort((a, b) => (a.date < b.date ? -1 : 1));
    setSchedules(next);
    // 入力はスクショに合わせて保持（タイトル・メモはクリアしないほうが使いやすい）
    setSelectedDate(null);
  };

  return (
    <div className="personal-page">
      {/* タイトル */}
      <h1 className="page-title">個人日程登録</h1>

      {/* 入力欄 */}
      <input
        className="title-input"
        type="text"
        placeholder="タイトルを入力してください"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="memo-input"
        placeholder="メモを入力してください"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
      />

      {/* カレンダー＋右サイド */}
      <div className="calendar-list-container">
        {/* カレンダー本体 */}
        <div className="calendar-container">
          <div className="calendar-header">
            <button aria-label="prev month" onClick={prevMonth}>
              ‹
            </button>
            <span>
              {y}年 {m + 1}月
            </span>
            <button aria-label="next month" onClick={nextMonth}>
              ›
            </button>
          </div>

          <table className="calendar-table">
            <thead>
              <tr>
                {weekLabels.map((w, i) => (
                  <th key={w} className={weekdayClass(i)}>
                    {w}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((cell, cIdx) => {
                    if (cell === null) return <td key={`e-${rIdx}-${cIdx}`} className="cell" />;

                    const dateStr = ymdd(y, m, cell);
                    const weekday = (firstWeekday + rIdx * 7 + cIdx) % 7;
                    const classes = ["cell", weekdayClass(weekday)];
                    const hName = holidayName(y, m, cell);
                    if (hName) classes.push("holiday");
                    if (isToday(y, m, cell)) classes.push("today");
                    if (isSelected(y, m, cell)) classes.push("selected");

                    return (
                      <td
                        key={dateStr}
                        className={classes.join(" ")}
                        onClick={() => onClickCell(y, m, cell)}
                      >
                        <div>{cell}</div>
                        {hName && <div className="holiday-name">{hName}</div>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 右サイド */}
        <aside className="side-panel">
          <div className="date-card">
            <div className="date-label">選択中の日程</div>
            <div>{selectedDate ? selectedDate : "未選択"}</div>
          </div>

          <button className="register-btn" onClick={handleRegister}>
            登録
          </button>

          <div className="registered-list" style={{ marginTop: 20 }}>
            <div className="schedule-header">登録済み予定</div>
            {schedules.length === 0 ? (
              <div style={{ opacity: 0.8 }}>まだ予定はありません</div>
            ) : (
              schedules.map((s) => (
                <div className="schedule-card" key={s.id}>
                  <div className="schedule-header">
                    {s.date} / <strong>{s.title}</strong>
                  </div>
                  {s.memo && <div>{s.memo}</div>}
                </div>
              ))
            )}
          </div>
        </aside>
      </div>

      {/* 下部の登録済み一覧（スクショに合わせて右側に既に表示しているため、ここは任意）
          画面下中央にも一覧を並べたい場合は以下のブロックを使ってください */}
      {/* 
      <section className="registered-list">
        <h2 className="schedule-header">登録済み予定</h2>
        {schedules.length === 0 ? (
          <div className="schedule-card">まだ予定はありません</div>
        ) : (
          schedules.map((s) => (
            <div className="schedule-card" key={s.id}>
              <div className="schedule-header">{s.date} / <strong>{s.title}</strong></div>
              {s.memo && <div>{s.memo}</div>}
            </div>
          ))
        )}
      </section>
      */}
    </div>
  );
}
