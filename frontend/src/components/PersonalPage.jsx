import React, { useMemo, useState, useEffect } from "react";
import Holidays from "date-holidays";
import "../personal.css";

/**
 * 個人日程登録 + Discord向けの変更不可共有リンク発行/表示
 * - 単日/範囲/複数選択
 * - 日付ごとに「終日/午前/午後/時間指定」を設定可能（時間指定は1時間プルダウン）
 * - 日本の祝日表示 / 日本時間で今日を強調
 * - 自分が作成した Discord 個別ユーザ向け「閲覧専用リンク」を一覧表示
 */
export default function PersonalPage() {
  /** ===== ユーティリティ ===== */
  const pad2 = (n) => String(n).padStart(2, "0");
  const ymd = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const ymdd = (Y, M, D) => `${Y}-${pad2(M + 1)}-${pad2(D)}`;

  // 日本時間の今日
  const todayJST = (() => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const jst = new Date(utc + 9 * 60 * 60000);
    return ymd(jst);
  })();

  // APIベース（バックエンドで変更してください）
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  /** ===== 状態 ===== */
  const [current, setCurrent] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");

  // 選択モード
  const [mode, setMode] = useState("single"); // single | range | multiple
  const [rangeStart, setRangeStart] = useState(null);

  // 選択された日付
  const [selectedDates, setSelectedDates] = useState(new Set());
  // 日付ごとの時間帯
  const [dateOptions, setDateOptions] = useState({}); // {dateStr: {timeType, startTime, endTime}}

  // 登録済み（ローカル）
  const [schedules, setSchedules] = useState([]);

  // Discord共有リンク
  const [discordUser, setDiscordUser] = useState(""); // 例: 123456789012345678 or user#1234
  const [shareLinks, setShareLinks] = useState([]);   // [{id, discordUser, title, url, createdAt}]
  const [loadingShare, setLoadingShare] = useState(false);

  // 祝日
  const hd = useMemo(() => new Holidays("JP"), []);

  /** ===== カレンダー派生 ===== */
  const y = current.getFullYear();
  const m = current.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const firstWeekday = new Date(y, m, 1).getDay();
  const weekdayHeaders = ["日", "月", "火", "水", "木", "金", "土"];

  // 1時間刻み
  const timeOptions1h = useMemo(() => {
    const arr = [];
    for (let h = 0; h <= 24; h++) arr.push(`${pad2(h)}:00`);
    return arr;
  }, []);

  /** ===== 祝日/クラス ===== */
  const holidayName = (Y, M, D) => {
    const info = hd.isHoliday(new Date(Y, M, D));
    return info ? info[0]?.name : null;
  };
  const isToday = (Y, M, D) => ymdd(Y, M, D) === todayJST;
  const isSelected = (Y, M, D) => selectedDates.has(ymdd(Y, M, D));
  const weekdayClass = (w) => (w === 0 ? "sunday" : w === 6 ? "saturday" : "");

  /** ===== 選択ヘルパ ===== */
  const ensureDefaultOption = (dateStr) => {
    setDateOptions((prev) => prev[dateStr] ? prev : ({ ...prev, [dateStr]: { timeType: "allday", startTime: null, endTime: null } }));
  };

  const addDate = (dateStr) => {
    setSelectedDates((prev) => new Set(prev).add(dateStr));
    ensureDefaultOption(dateStr);
  };
  const removeDate = (dateStr) => {
    setSelectedDates((prev) => {
      const next = new Set(prev);
      next.delete(dateStr);
      return next;
    });
    setDateOptions((prev) => {
      const copy = { ...prev };
      delete copy[dateStr];
      return copy;
    });
  };

  /** ===== クリック処理 ===== */
  const handleCellClick = (Y, M, D) => {
    const dateStr = ymdd(Y, M, D);
    if (mode === "single") {
      setSelectedDates(new Set([dateStr]));
      setDateOptions((prev) => ({ [dateStr]: prev[dateStr] || { timeType: "allday", startTime: null, endTime: null } }));
      setRangeStart(null);
    } else if (mode === "multiple") {
      selectedDates.has(dateStr) ? removeDate(dateStr) : addDate(dateStr);
    } else if (mode === "range") {
      if (!rangeStart) {
        setRangeStart(dateStr);
        setSelectedDates(new Set([dateStr]));
        ensureDefaultOption(dateStr);
        return;
      }
      const a = new Date(rangeStart);
      const b = new Date(dateStr);
      const start = a <= b ? a : b;
      const end = a <= b ? b : a;
      const next = new Set();
      const opts = { ...dateOptions };
      const cur = new Date(start);
      while (cur <= end) {
        const ds = ymd(cur);
        next.add(ds);
        if (!opts[ds]) opts[ds] = { timeType: "allday", startTime: null, endTime: null };
        cur.setDate(cur.getDate() + 1);
      }
      setSelectedDates(next);
      setDateOptions(opts);
      setRangeStart(null);
    }
  };

  /** ===== カレンダー行列 ===== */
  const matrix = useMemo(() => {
    const cells = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    const rows = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [firstWeekday, daysInMonth]);

  /** ===== 日付ごとの時間帯更新 ===== */
  const setTimeTypeForDate = (dateStr, t) => {
    setDateOptions((prev) => {
      const old = prev[dateStr] || { timeType: "allday", startTime: null, endTime: null };
      let s = old.startTime, e = old.endTime;
      if (t !== "custom") { s = null; e = null; }
      else { s = s || "09:00"; e = e || "18:00"; }
      return { ...prev, [dateStr]: { timeType: t, startTime: s, endTime: e } };
    });
  };
  const setStartForDate = (dateStr, v) => setDateOptions((p) => ({ ...p, [dateStr]: { ...(p[dateStr] || { timeType:"custom" }), timeType:"custom", startTime: v, endTime: (p[dateStr]?.endTime || "18:00") } }));
  const setEndForDate   = (dateStr, v) => setDateOptions((p) => ({ ...p, [dateStr]: { ...(p[dateStr] || { timeType:"custom" }), timeType:"custom", startTime: (p[dateStr]?.startTime || "09:00"), endTime: v } }));

  /** ===== 登録（ローカル反映） ===== */
  const handleRegister = () => {
    if (!title.trim() || selectedDates.size === 0) return;
    const newItems = Array.from(selectedDates).sort().map((date) => {
      const opt = dateOptions[date] || { timeType: "allday", startTime: null, endTime: null };
      return {
        id: `${date}-${Date.now()}`,
        date,
        title: title.trim(),
        memo: memo.trim(),
        timeType: opt.timeType,
        startTime: opt.timeType === "custom" ? opt.startTime : null,
        endTime: opt.timeType === "custom" ? opt.endTime : null,
      };
    });
    const merged = [...schedules, ...newItems].sort((a, b) => (a.date < b.date ? -1 : 1));
    setSchedules(merged);
    setSelectedDates(new Set());
    setDateOptions({});
    setRangeStart(null);
  };

  /** ===== 共有リンク（Discord） ===== */
  const loadShareLinks = async () => {
    try {
      const res = await fetch(`${API_URL}/api/personal-shares`);
      if (!res.ok) return;
      const data = await res.json();
      setShareLinks(Array.isArray(data) ? data : []);
    } catch {}
  };
  useEffect(() => { loadShareLinks(); /* 初回取得 */ }, []);

  const issueShareLink = async () => {
    if (!title.trim() || !discordUser.trim()) return;
    setLoadingShare(true);
    try {
      // 読み取り専用リンク（サーバ側でトークン+discordUserにスコープを固定）
      const res = await fetch(`${API_URL}/api/personal-shares`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discordUser: discordUser.trim(), // ID or name#tag
          title: title.trim(),            // リンクに表示するタイトル
        }),
      });
      if (!res.ok) throw new Error("share create failed");
      const created = await res.json(); // {id, discordUser, title, url, createdAt}
      setShareLinks((prev) => [created, ...prev]);
      setDiscordUser("");
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingShare(false);
    }
  };

  /** ===== 表示用ラベル ===== */
  const timeLabel = (t, s, e) =>
    t === "allday" ? "終日" : t === "morning" ? "午前" : t === "afternoon" ? "午後" : `${s ?? "—"}〜${e ?? "—"}`;

  /** ===== 月移動 ===== */
  const prevMonth = () => setCurrent(new Date(y, m - 1, 1));
  const nextMonth = () => setCurrent(new Date(y, m + 1, 1));

  /** ===== JSX ===== */
  return (
    <div className="personal-page">
      <h1 className="page-title">個人日程登録</h1>

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

      {/* モード切替 */}
      <div className="select-mode">
        {[
          { key: "single", label: "単日選択" },
        { key: "range", label: "範囲選択" },
          { key: "multiple", label: "複数選択" },
        ].map((b) => (
          <button
            key={b.key}
            className={mode === b.key ? "active" : ""}
            onClick={() => {
              setMode(b.key);
              setSelectedDates(new Set());
              setDateOptions({});
              setRangeStart(null);
            }}
          >
            {b.label}
          </button>
        ))}
      </div>

      <div className="calendar-list-container">
        {/* カレンダー */}
        <div className="calendar-container">
          <div className="calendar-header">
            <button aria-label="prev month" onClick={prevMonth}>‹</button>
            <span>{y}年 {m + 1}月</span>
            <button aria-label="next month" onClick={nextMonth}>›</button>
          </div>

          <table className="calendar-table">
            <thead>
              <tr>
                {weekdayHeaders.map((w, i) => (
                  <th key={w} className={weekdayClass(i)}>{w}</th>
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
                        onClick={() => handleCellClick(y, m, cell)}
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

        {/* 右サイド：選択日ごとの時間帯設定 & 登録 */}
        <aside className="side-panel">
          <div>
            <h2>選択中の日程</h2>

            {selectedDates.size === 0 ? (
              <div className="date-card">
                <div className="date-label">未選択</div>
                <div style={{ opacity: 0.85 }}>
                  {mode === "range"
                    ? "開始日 → 終了日の順でクリックしてください"
                    : mode === "multiple"
                    ? "複数日をクリックで選択/解除できます"
                    : "カレンダーから1日選択してください"}
                </div>
              </div>
            ) : (
              Array.from(selectedDates).sort().map((d) => {
                const opt = dateOptions[d] || { timeType: "allday", startTime: null, endTime: null };
                return (
                  <div className="date-card" key={d}>
                    <div className="date-label">{d}</div>

                    <div className="time-options">
                      {[
                        { k: "allday", t: "終日" },
                        { k: "morning", t: "午前" },
                        { k: "afternoon", t: "午後" },
                        { k: "custom", t: "時間指定" },
                      ].map((o) => (
                        <button
                          key={o.k}
                          className={`time-btn ${opt.timeType === o.k ? "active" : ""}`}
                          onClick={() => setTimeTypeForDate(d, o.k)}
                        >
                          {o.t}
                        </button>
                      ))}
                    </div>

                    {opt.timeType === "custom" && (
                      <div className="time-range">
                        <select
                          className="cute-select"
                          value={opt.startTime || "09:00"}
                          onChange={(e) => setStartForDate(d, e.target.value)}
                        >
                          {timeOptions1h.map((t) => (
                            <option key={`s-${d}-${t}`} value={t}>{t}</option>
                          ))}
                        </select>
                        <span className="time-separator">〜</span>
                        <select
                          className="cute-select"
                          value={opt.endTime || "18:00"}
                          onChange={(e) => setEndForDate(d, e.target.value)}
                        >
                          {timeOptions1h.map((t) => (
                            <option key={`e-${d}-${t}`} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <button className="register-btn" onClick={handleRegister}>登録</button>
        </aside>
      </div>

      {/* 登録済み一覧 */}
      <section className="registered-list">
        <h2 className="schedule-header">登録済みスケジュール</h2>
        {schedules.length === 0 ? (
          <div className="schedule-card">まだ予定はありません</div>
        ) : (
          schedules.map((s) => (
            <div className="schedule-card" key={s.id}>
              <div className="schedule-header">
                {s.date} / {timeLabel(s.timeType, s.startTime, s.endTime)}
              </div>
              <div><strong>{s.title}</strong></div>
              {s.memo && <div style={{ marginTop: 4 }}>{s.memo}</div>}
            </div>
          ))
        )}
      </section>

      {/* Discord 共有リンク（変更不可の閲覧リンク） */}
      <section className="registered-list">
        <h2 className="schedule-header">Discord 共有リンク（閲覧のみ）</h2>

        <div className="schedule-card">
          <div className="schedule-header">個別ユーザーを指定して共有リンクを発行</div>
          <input
            className="title-input"
            style={{ maxWidth: 420, margin: "10px auto" }}
            value={discordUser}
            onChange={(e) => setDiscordUser(e.target.value)}
            placeholder="DiscordユーザーID または ユーザー名#タグ"
          />
          <button className="register-btn" onClick={issueShareLink} disabled={loadingShare || !title.trim() || !discordUser.trim()}>
            {loadingShare ? "発行中..." : "共有リンクを発行（変更不可）"}
          </button>
          <div style={{ opacity: 0.85, marginTop: 8, textAlign: "center" }}>
            ※発行されるリンクは「閲覧専用」です。相手は編集できません。
          </div>
        </div>

        {shareLinks.length === 0 ? (
          <div className="schedule-card">まだ共有リンクはありません</div>
        ) : (
          shareLinks.map((l) => (
            <div className="schedule-card" key={l.id}>
              <div className="schedule-header">{l.title || "(無題)"} / {l.discordUser}</div>
              <div>
                <a href={l.url} target="_blank" rel="noreferrer" style={{ color: "#fff", textDecoration: "underline" }}>
                  {l.url}
                </a>
              </div>
              {l.createdAt && (
                <div style={{ opacity: 0.8, marginTop: 6 }}>
                  発行日時: {new Date(l.createdAt).toLocaleString()}
                </div>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  );
}
