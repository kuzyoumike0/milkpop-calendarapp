// frontend/src/components/PersonalPage.jsx
import React, { useMemo, useState, useEffect } from "react";
import Holidays from "date-holidays";
import "../personal.css";
import { createPersonalEvent, listPersonalEvents } from "../api";

export default function PersonalPage() {
  // ===== ヘルパ =====
  const pad2 = (n) => String(n).padStart(2, "0");
  const ymd = (d) =>
    `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const ymdd = (Y, M, D) => `${Y}-${pad2(M + 1)}-${pad2(D)}`;

  // 日本時間の今日（表示用）
  const todayJST = (() => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const jst = new Date(utc + 9 * 60 * 60000);
    return ymd(jst);
  })();

  // ===== 状態 =====
  const [current, setCurrent] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [mode, setMode] = useState("single"); // single | range | multiple
  const [rangeStart, setRangeStart] = useState(null);
  const [selectedDates, setSelectedDates] = useState(new Set());
  const [dateOptions, setDateOptions] = useState({}); // {dateStr: {timeType, startTime, endTime}}
  const [schedules, setSchedules] = useState([]); // 画面内で直近登録したものの即時反映用

  // 共有リンク一覧（personal-events と schedules/mine をマージ）
  const [shareLinks, setShareLinks] = useState([]);
  const [loadingShares, setLoadingShares] = useState(false);

  // 自分の保存済み日程（サーバ由来の正式データ）
  const [myEvents, setMyEvents] = useState([]); // {id,title,memo,date,timeType,startTime,endTime,createdAt}[]
  const [loadingMyEvents, setLoadingMyEvents] = useState(false);

  // 読み込み/エラー表示
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [creatingShare, setCreatingShare] = useState(false);
  const [shareMsg, setShareMsg] = useState("");

  // ===== 祝日 =====
  const hd = useMemo(() => new Holidays("JP"), []);

  // ===== カレンダー情報 =====
  const y = current.getFullYear();
  const m = current.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const firstWeekday = new Date(y, m, 1).getDay();
  const weekdayHeaders = ["日", "月", "火", "水", "木", "金", "土"];

  // 1時間刻みの時刻
  const timeOptions1h = useMemo(() => {
    const arr = [];
    for (let h = 0; h <= 24; h++) arr.push(`${pad2(h)}:00`);
    return arr;
  }, []);

  // ===== 祝日・クラス =====
  const holidayName = (Y, M, D) => {
    try {
      const info = hd.isHoliday(new Date(Y, M, D));
      return info ? info[0]?.name : null;
    } catch {
      return null;
    }
  };
  const isToday = (Y, M, D) => ymdd(Y, M, D) === todayJST;
  const isSelected = (Y, M, D) => selectedDates.has(ymdd(Y, M, D));
  const weekdayClass = (w) => (w === 0 ? "sunday" : w === 6 ? "saturday" : "");

  // ===== 選択ヘルパ =====
  const ensureDefaultOption = (dateStr) => {
    setDateOptions((prev) =>
      prev[dateStr]
        ? prev
        : { ...prev, [dateStr]: { timeType: "allday", startTime: null, endTime: null } }
    );
  };
  const addDate = (dateStr) => {
    setSelectedDates((prev) => {
      const next = new Set(prev);
      next.add(dateStr);
      return next;
    });
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

  // ===== 日付クリック =====
  const handleCellClick = (Y, M, D) => {
    const dateStr = ymdd(Y, M, D);
    if (mode === "single") {
      setSelectedDates(new Set([dateStr]));
      setDateOptions((prev) => ({
        [dateStr]:
          prev[dateStr] || { timeType: "allday", startTime: null, endTime: null },
      }));
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
        if (!opts[ds])
          opts[ds] = { timeType: "allday", startTime: null, endTime: null };
        cur.setDate(cur.getDate() + 1);
      }
      setSelectedDates(next);
      setDateOptions(opts);
      setRangeStart(null);
    }
  };

  // ===== カレンダー行列 =====
  const matrix = useMemo(() => {
    const cells = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    const rows = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [firstWeekday, daysInMonth]);

  // ===== 時間帯設定 =====
  const setTimeTypeForDate = (dateStr, t) => {
    setDateOptions((prev) => {
      const old =
        prev[dateStr] || { timeType: "allday", startTime: null, endTime: null };
      let s = old.startTime,
        e = old.endTime;
      if (t !== "custom") {
        s = null;
        e = null;
      } else {
        s = s || "09:00";
        e = e || "18:00";
      }
      return { ...prev, [dateStr]: { timeType: t, startTime: s, endTime: e } };
    });
  };
  const setStartForDate = (dateStr, v) =>
    setDateOptions((p) => ({
      ...p,
      [dateStr]: { ...(p[dateStr] || {}), timeType: "custom", startTime: v },
    }));
  const setEndForDate = (dateStr, v) =>
    setDateOptions((p) => ({
      ...p,
      [dateStr]: { ...(p[dateStr] || {}), timeType: "custom", endTime: v },
    }));

  // ===== 個人日程 登録（ローカル即時反映 + サーバ登録） =====
  const handleRegister = async () => {
    if (!title.trim() || selectedDates.size === 0) return;

    // クライアント即時反映（ローカル）
    const newItems = Array.from(selectedDates).sort().map((date) => {
      const opt =
        dateOptions[date] || { timeType: "allday", startTime: null, endTime: null };
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
    const merged = [...schedules, ...newItems].sort((a, b) =>
      a.date < b.date ? -1 : 1
    );
    setSchedules(merged);

    // サーバ登録（共有リンクはサーバ側で自動発行 → 一覧に反映）
    try {
      setLoading(true);
      setErrorMsg("");

      const payload = Array.from(selectedDates).sort().map((d) => {
        const opt = dateOptions[d] || { timeType: "allday" };
        return {
          date: d,
          timeType: opt.timeType,
          startTime: opt.timeType === "custom" ? opt.startTime || "09:00" : null,
          endTime: opt.timeType === "custom" ? opt.endTime || "18:00" : null,
        };
      });

      await createPersonalEvent({
        title: title.trim(),
        memo: memo.trim(),
        dates: payload,
        options: {},
      });

      // 再取得（share_url / myEvents を含む）
      await Promise.all([loadShareLinks(), loadMyEvents()]);
    } catch (e) {
      console.error("個人スケジュール登録エラー:", e);
      if (e?.status === 401) {
        setErrorMsg("認証エラー（401）。ログインし直すか、JWTトークンを再発行してください。");
      } else {
        setErrorMsg("登録に失敗しました。時間をおいて再度お試しください。");
      }
    } finally {
      setLoading(false);
    }

    // 入力クリア
    setSelectedDates(new Set());
    setDateOptions({});
    setRangeStart(null);
  };

  // ===== 共有リンク一覧の取得（personal + schedules/mine をマージ）=====
  const loadShareLinks = async () => {
    const base = window.location.origin;
    try {
      setLoadingShares(true);
      setErrorMsg("");

      // 1) 個人イベント（旧来の share_url）
      let personal = [];
      try {
        const list = await listPersonalEvents();
        personal = (list || [])
          .filter((it) => !!it.share_url)
          .map((it) => ({
            id: it.id,
            title: it.title || "個人スケジュール",
            url: it.share_url,
            createdAt: it.created_at,
            source: "personal",
          }));
      } catch (e) {
        console.warn("personal-events fetch warn:", e);
      }

      // 2) 空日程でも作れる共有（/api/schedules/create → /api/schedules/mine）
      let mine = [];
      try {
        const res = await fetch("/api/schedules/mine", { credentials: "include" });
        if (res.ok) {
          const rows = await res.json();
          mine = (rows || []).map((r) => ({
            id: r.id,
            title: r.title || "共有スケジュール",
            url: `${base}/share/${r.share_token}`,
            createdAt: r.created_at,
            source: "mine",
          }));
        }
      } catch (e) {
        console.warn("schedules/mine fetch warn:", e);
      }

      // 3) マージ（url をキーに重複排除）
      const map = new Map();
      [...personal, ...mine].forEach((x) => {
        if (!map.has(x.url)) map.set(x.url, x);
      });
      const merged = Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );

      setShareLinks(merged);
    } catch (e) {
      console.error("共有リンク取得エラー:", e);
      if (e?.status === 401) {
        setErrorMsg("認証エラー（401）。ログインし直すか、JWTトークンを再発行してください。");
      } else {
        setErrorMsg("共有リンクの取得に失敗しました。");
      }
    } finally {
      setLoadingShares(false);
    }
  };

  // ===== 自分の保存済み日程を取得（表示用） =====
  const loadMyEvents = async () => {
    try {
      setLoadingMyEvents(true);
      setErrorMsg("");
      const list = await listPersonalEvents(); // /api/personal-events
      // フラット化して日付順に並べる
      const flattened = (list || []).flatMap((p) => {
        const dates = Array.isArray(p.dates) ? p.dates : [];
        return dates.map((d) => ({
          id: `${p.id}-${d.date}`,
          title: p.title || "個人スケジュール",
          memo: p.memo || "",
          date: d.date,
          timeType: d.timeType || "allday",
          startTime: d.startTime || null,
          endTime: d.endTime || null,
          createdAt: p.created_at,
        }));
      });
      flattened.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
      setMyEvents(flattened);
    } catch (e) {
      console.error("自分の日程取得エラー:", e);
      if (e?.status === 401) {
        setErrorMsg("認証エラー（401）。ログインし直すか、JWTトークンを再発行してください。");
      } else {
        setErrorMsg("自分の日程の取得に失敗しました。");
      }
    } finally {
      setLoadingMyEvents(false);
    }
  };

  // ===== 共有リンクを「日程0件でも」発行（/api/schedules/create） =====
  const createEmptyShare = async () => {
    try {
      setCreatingShare(true);
      setShareMsg("");
      setErrorMsg("");

      const res = await fetch("/api/schedules/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim() || "未設定スケジュール",
          // ★ ここがポイント：日程0件でもOK
          dates: [],
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "create failed");
      }
      const data = await res.json();
      const base = window.location.origin;
      const url = `${base}/share/${data.share_token}`;
      setShareMsg(`共有リンクを発行しました: ${url}`);

      // 即反映
      setShareLinks((prev) => [
        {
          id: data.id,
          title: title.trim() || "未設定スケジュール",
          url,
          createdAt: new Date().toISOString(),
          source: "mine",
        },
        ...prev,
      ]);
    } catch (e) {
      console.error("共有リンク発行エラー:", e);
      setErrorMsg("共有リンクの発行に失敗しました。ログイン状態と権限を確認してください。");
    } finally {
      setCreatingShare(false);
    }
  };

  useEffect(() => {
    // 初回：共有リンク & 自分の日程 両方ロード
    Promise.all([loadShareLinks(), loadMyEvents()]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== 表示ラベル =====
  const timeLabel = (t, s, e) =>
    t === "allday"
      ? "終日"
      : t === "morning"
      ? "午前"
      : t === "afternoon"
      ? "午後"
      : `${s ?? "—"}〜${e ?? "—"}`;

  // ===== 月移動 =====
  const prevMonth = () => setCurrent(new Date(y, m - 1, 1));
  const nextMonth = () => setCurrent(new Date(y, m + 1, 1));

  // ====== UI ======
  return (
    <div className="personal-page">
      {/* バナー（全ページ共通ナビ） */}
      <header className="banner">
        <div className="brand">MilkPOP Calendar</div>
        <nav className="nav">
          <a href="/">トップ</a>
          <a href="/register">日程登録</a>
          <a className="active" href="/personal">
            個人スケジュール
          </a>
        </nav>
      </header>

      <h1 className="page-title">個人日程登録</h1>

      {/* 入力 */}
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

      {/* カレンダー + サイドパネル */}
      <div className="calendar-list-container">
        {/* カレンダー */}
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
                {weekdayHeaders.map((w, i) => (
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
                    if (cell === null)
                      return <td key={`e-${rIdx}-${cIdx}`} className="cell" />;
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

          <div className="legend">
            <span className="legend-item">
              <i className="box selected" />
              選択中
            </span>
            <span className="legend-item">
              <i className="box holiday" />
              祝日
            </span>
            <span className="legend-item">
              <i className="box today" />
              今日
            </span>
          </div>
        </div>

        {/* サイドパネル（日時指定） */}
        <aside className="side-panel">
          <div>
            <h2>選択中の日程</h2>
            {selectedDates.size === 0 ? (
              <div className="date-card">
                <div className="date-label">未選択</div>
              </div>
            ) : (
              Array.from(selectedDates)
                .sort()
                .map((d) => {
                  const opt =
                    dateOptions[d] || {
                      timeType: "allday",
                      startTime: null,
                      endTime: null,
                    };
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
                            className={`time-btn ${
                              opt.timeType === o.k ? "active" : ""
                            }`}
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
                              <option key={`s-${d}-${t}`} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                          <span className="time-separator">〜</span>
                          <select
                            className="cute-select"
                            value={opt.endTime || "18:00"}
                            onChange={(e) => setEndForDate(d, e.target.value)}
                          >
                            {timeOptions1h.map((t) => (
                              <option key={`e-${d}-${t}`} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })
            )}
          </div>

          <button className="register-btn" onClick={handleRegister} disabled={loading}>
            {loading ? "保存中..." : "登録"}
          </button>

          {/* 共有リンクを「日程0件でも」発行 */}
          <button
            className="register-btn"
            style={{ marginTop: 10 }}
            onClick={createEmptyShare}
            disabled={creatingShare}
            title="ログイン済みなら、日程未選択でも共有用URLを発行します"
          >
            {creatingShare ? "共有リンク発行中..." : "共有リンクを発行（0件でも可）"}
          </button>
          {!!shareMsg && <div className="info" style={{ marginTop: 8 }}>{shareMsg}</div>}

          {!!errorMsg && <div className="error">{errorMsg}</div>}
        </aside>
      </div>

      {/* 登録済み予定（ローカル即時反映の簡易表示） */}
      <section className="registered-list">
        <h2 className="schedule-header">（この画面で直近追加した）登録済みスケジュール</h2>
        {schedules.length === 0 ? (
          <div className="schedule-card">まだ予定はありません</div>
        ) : (
          schedules.map((s) => (
            <div className="schedule-card" key={s.id}>
              <div className="schedule-header">
                {s.date} / {timeLabel(s.timeType, s.startTime, s.endTime)}
              </div>
              <div>
                <strong>{s.title}</strong>
              </div>
              {s.memo && <div style={{ marginTop: 4 }}>{s.memo}</div>}
            </div>
          ))
        )}
      </section>

      {/* ★ 自分の保存済み日程（サーバ由来 / 常時閲覧） */}
      <section className="registered-list">
        <h2 className="schedule-header">あなたの個人日程（保存済み）</h2>
        {loadingMyEvents ? (
          <div className="schedule-card">読み込み中...</div>
        ) : myEvents.length === 0 ? (
          <div className="schedule-card">保存済みの日程はまだありません</div>
        ) : (
          myEvents.map((ev) => (
            <div className="schedule-card" key={ev.id}>
              <div className="schedule-header">
                {ev.date} / {timeLabel(ev.timeType, ev.startTime, ev.endTime)}
              </div>
              <div>
                <strong>{ev.title}</strong>
              </div>
              {ev.memo && <div style={{ marginTop: 4 }}>{ev.memo}</div>}
            </div>
          ))
        )}
      </section>

      {/* 共有リンク一覧（読み込み中と空の表示を分岐） */}
      <section className="registered-list">
        <h2 className="schedule-header">共有リンク一覧</h2>
        {loadingShares ? (
          <div className="schedule-card">共有リンクを読み込み中...</div>
        ) : shareLinks.length === 0 ? (
          <div className="schedule-card">
            まだ共有リンクがありません。「共有リンクを発行（0件でも可）」を押してください。
          </div>
        ) : (
          shareLinks.map((l) => (
            <div className="schedule-card" key={l.url}>
              <div className="schedule-header">{l.title}</div>
              <div>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#fff", textDecoration: "underline" }}
                >
                  {l.url}
                </a>
              </div>
              {l.createdAt && (
                <div style={{ opacity: 0.8, marginTop: 6 }}>
                  発行日時: {new Date(l.createdAt).toLocaleString()}
                  {l.source ? `（${l.source}）` : ""}
                </div>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  );
}
