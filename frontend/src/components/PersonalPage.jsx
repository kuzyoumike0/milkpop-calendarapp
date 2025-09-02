// frontend/src/components/PersonalPage.jsx
import React, { useMemo, useState, useEffect } from "react";
import Holidays from "date-holidays";
// ⚠️ CSS は App.jsx で一括読込するため、このファイルからはインポートしません。
// import "../personal.css";
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

  // サーバ由来の正式な個人日程（カード単位で編集/削除可能）
  const [personalList, setPersonalList] = useState([]); // [{id,title,memo,dates:[...] ,created_at}]
  const [loadingPersonal, setLoadingPersonal] = useState(false);

  // 編集用
  const [editingId, setEditingId] = useState(null);
  const [editBuffer, setEditBuffer] = useState(null);

  // 読み込み/エラー表示
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

  // ===== 登録（ローカル即時反映 + サーバ登録） =====
  const handleRegister = async () => {
    const safeTitle = title.trim() || "未設定タイトル";
    if (!safeTitle || selectedDates.size === 0) {
      setErrorMsg("タイトルと日付を入力してください。");
      return;
    }

    // クライアント即時反映（画面下「登録済みスケジュール」）
    const newItems = Array.from(selectedDates).sort().map((date) => {
      const opt =
        dateOptions[date] || { timeType: "allday", startTime: null, endTime: null };
      return {
        id: `${date}-${Date.now()}`,
        date,
        title: safeTitle,
        memo: memo.trim(),
        timeType: opt.timeType,
        startTime: opt.timeType === "custom" ? opt.startTime : null,
        endTime: opt.timeType === "custom" ? opt.endTime : null,
      };
    });
    setSchedules((prev) =>
      [...prev, ...newItems].sort((a, b) => (a.date < b.date ? -1 : 1))
    );

    // サーバ登録（完了後に正式データで一覧を再同期）
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
        title: safeTitle,
        memo: memo.trim(),
        dates: payload,
        options: {},
      });

      await loadPersonalList();
    } catch (e) {
      console.error("個人スケジュール登録エラー:", e);
      setErrorMsg("登録に失敗しました。ログイン状態やネットワークを確認してください。");
    } finally {
      setLoading(false);
    }

    // 入力クリア
    setSelectedDates(new Set());
    setDateOptions({});
    setRangeStart(null);
  };

  // ===== サーバから自分の個人日程（カード単位）を取得 =====
  const loadPersonalList = async () => {
    try {
      setLoadingPersonal(true);
      setErrorMsg("");
      const list = await listPersonalEvents(); // /api/personal-events
      const normalized = (list || []).map((p) => ({
        id: p.id,
        title: p.title || "個人スケジュール",
        memo: p.memo || "",
        dates: (Array.isArray(p.dates) ? p.dates : []).map((d) => ({
          date: d.date,
          timeType: d.timeType || "allday",
          startTime: d.startTime || null,
          endTime: d.endTime || null,
        })),
        created_at: p.created_at,
      }));
      setPersonalList(normalized);
    } catch (e) {
      console.error("自分の個人日程取得エラー:", e);
      setErrorMsg("自分の個人日程の取得に失敗しました。");
    } finally {
      setLoadingPersonal(false);
    }
  };

  useEffect(() => {
    loadPersonalList();
  }, []);

  // ===== 編集/削除 =====
  const startEdit = (item) => {
    setEditingId(item.id);
    setEditBuffer(JSON.parse(JSON.stringify(item)));
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditBuffer(null);
  };
  const updateEditTitle = (v) =>
    setEditBuffer((b) => ({ ...b, title: v }));
  const updateEditMemo = (v) =>
    setEditBuffer((b) => ({ ...b, memo: v }));

  const updateEditDateField = (idx, key, val) =>
    setEditBuffer((b) => {
      const dates = b.dates.slice();
      const d = { ...dates[idx] };
      if (key === "timeType") {
        d.timeType = val;
        if (val !== "custom") {
          d.startTime = null;
          d.endTime = null;
        } else {
          d.startTime = d.startTime || "09:00";
          d.endTime = d.endTime || "18:00";
        }
      } else {
        d[key] = val;
      }
      dates[idx] = d;
      return { ...b, dates };
    });

  const removeEditDate = (idx) =>
    setEditBuffer((b) => {
      const dates = b.dates.slice();
      dates.splice(idx, 1);
      return { ...b, dates };
    });

  const saveEdit = async () => {
    if (!editBuffer) return;
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await fetch(`/api/personal-events/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: editBuffer.title,
          memo: editBuffer.memo,
          dates: editBuffer.dates.map((d) => ({
            date: d.date,
            timeType: d.timeType || "allday",
            startTime: d.timeType === "custom" ? d.startTime || "09:00" : null,
            endTime: d.timeType === "custom" ? d.endTime || "18:00" : null,
          })),
          options: {},
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      await loadPersonalList();
      cancelEdit();
    } catch (e) {
      console.error("個人日程更新エラー:", e);
      setErrorMsg("更新に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm("この個人日程を削除しますか？")) return;
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await fetch(`/api/personal-events/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      setPersonalList((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      console.error("個人日程削除エラー:", e);
      setErrorMsg("削除に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

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

      {/* ★ サーバ保存済みの個人日程（編集/削除可能） */}
      <section className="registered-list">
        <h2 className="schedule-header">あなたの個人日程（保存済み）</h2>

        {loadingPersonal ? (
          <div className="schedule-card">読み込み中...</div>
        ) : personalList.length === 0 ? (
          <div className="schedule-card">保存済みの日程はまだありません</div>
        ) : (
          personalList.map((item) => {
            const isEdit = editingId === item.id;
            const view = isEdit ? editBuffer : item;

            return (
              <div className="schedule-card" key={item.id}>
                {/* タイトル & 操作 */}
                <div className="schedule-header" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                  {isEdit ? (
                    <input
                      className="title-input"
                      value={view.title}
                      onChange={(e) => updateEditTitle(e.target.value)}
                      placeholder="タイトル"
                      style={{ maxWidth: 260, margin: 0 }}
                    />
                  ) : (
                    <strong>{item.title}</strong>
                  )}

                  <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                    {!isEdit ? (
                      <>
                        <button className="time-btn" onClick={() => startEdit(item)}>編集</button>
                        <button className="time-btn" onClick={() => deleteItem(item.id)}>削除</button>
                      </>
                    ) : (
                      <>
                        <button className="time-btn active" onClick={saveEdit} disabled={loading}>保存</button>
                        <button className="time-btn" onClick={cancelEdit}>キャンセル</button>
                      </>
                    )}
                  </div>
                </div>

                {/* メモ */}
                <div style={{ margin: "8px 0" }}>
                  {isEdit ? (
                    <textarea
                      className="memo-input"
                      value={view.memo}
                      onChange={(e) => updateEditMemo(e.target.value)}
                      placeholder="メモ"
                      style={{ minHeight: 64 }}
                    />
                  ) : (
                    item.memo ? <div>{item.memo}</div> : <div style={{ opacity: 0.7 }}>（メモなし）</div>
                  )}
                </div>

                {/* 日付一覧（編集/閲覧） */}
                <div style={{ display: "grid", gap: 8 }}>
                  {view.dates.map((d, idx) =>
                    !isEdit ? (
                      <div key={`${item.id}-${d.date}`} className="date-card">
                        <div className="date-label">
                          {d.date} / {timeLabel(d.timeType, d.startTime, d.endTime)}
                        </div>
                      </div>
                    ) : (
                      <div key={`${item.id}-edit-${d.date}`} className="date-card" style={{ alignItems: "center" }}>
                        <div className="date-label">{d.date}</div>
                        <div className="time-options" style={{ marginTop: 6, flexWrap: "wrap", gap: 6 }}>
                          {[
                            { k: "allday", t: "終日" },
                            { k: "morning", t: "午前" },
                            { k: "afternoon", t: "午後" },
                            { k: "custom", t: "時間指定" },
                          ].map((o) => (
                            <button
                              key={o.k}
                              className={`time-btn ${d.timeType === o.k ? "active" : ""}`}
                              onClick={() => updateEditDateField(idx, "timeType", o.k)}
                            >
                              {o.t}
                            </button>
                          ))}
                          <button className="time-btn" onClick={() => removeEditDate(idx)}>この日を削除</button>
                        </div>
                        {d.timeType === "custom" && (
                          <div className="time-range" style={{ marginTop: 6 }}>
                            <select
                              className="cute-select"
                              value={d.startTime || "09:00"}
                              onChange={(e) => updateEditDateField(idx, "startTime", e.target.value)}
                            >
                              {timeOptions1h.map((t) => (
                                <option key={`s-${item.id}-${idx}-${t}`} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                            <span className="time-separator">〜</span>
                            <select
                              className="cute-select"
                              value={d.endTime || "18:00"}
                              onChange={(e) => updateEditDateField(idx, "endTime", e.target.value)}
                            >
                              {timeOptions1h.map((t) => (
                                <option key={`e-${item.id}-${idx}-${t}`} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    )
                  )}
                  {isEdit && view.dates.length === 0 && (
                    <div className="date-card">
                      <div className="date-label">このカードには日程がありません（保存すると空のまま更新されます）</div>
                    </div>
                  )}
                </div>

                {item.created_at && (
                  <div style={{ opacity: 0.8, marginTop: 8 }}>
                    作成日時: {new Date(item.created_at).toLocaleString()}
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
