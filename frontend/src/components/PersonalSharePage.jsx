// frontend/src/components/PersonalSharePage.jsx
import React, { useEffect, useMemo, useState, useMemo as useMemo2 } from "react";
import { useParams } from "react-router-dom";
import "../common.css";
import "../personal.css";

/* ========================= ユーティリティ ========================= */
const pad = (n) => String(n).padStart(2, "0");
const fmt = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
const wdJP = ["日", "月", "火", "水", "木", "金", "土"];
const todayStr = (() => {
  const t = new Date();
  return fmt(t.getFullYear(), t.getMonth() + 1, t.getDate());
})();

function nthMonday(year, month, n) {
  const first = new Date(year, month - 1, 1);
  const offset = (8 - first.getDay()) % 7;
  return fmt(year, month, 1 + offset + 7 * (n - 1));
}

// 春分・秋分（必要年だけ）
const EQUINOX = {
  vernal: { 2024: "2024-03-20", 2025: "2025-03-20", 2026: "2026-03-20" },
  autumnal: { 2024: "2024-09-22", 2025: "2025-09-23", 2026: "2026-09-22" },
};

function buildJapaneseHolidays(year) {
  const map = new Map();
  map.set(fmt(year, 1, 1), "元日");
  map.set(nthMonday(year, 1, 2), "成人の日");
  map.set(fmt(year, 2, 11), "建国記念の日");
  map.set(fmt(year, 2, 23), "天皇誕生日");
  if (EQUINOX.vernal[year]) map.set(EQUINOX.vernal[year], "春分の日");
  map.set(fmt(year, 4, 29), "昭和の日");
  map.set(fmt(year, 5, 3), "憲法記念日");
  map.set(fmt(year, 5, 4), "みどりの日");
  map.set(fmt(year, 5, 5), "こどもの日");
  map.set(nthMonday(year, 7, 3), "海の日");
  map.set(fmt(year, 8, 11), "山の日");
  map.set(nthMonday(year, 9, 3), "敬老の日");
  if (EQUINOX.autumnal[year]) map.set(EQUINOX.autumnal[year], "秋分の日");
  map.set(nthMonday(year, 10, 2), "スポーツの日");
  map.set(fmt(year, 11, 3), "文化の日");
  map.set(fmt(year, 11, 23), "勤労感謝の日");

  const isHoliday = (dstr) => map.has(dstr);
  const nextDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);

  // 振替休日
  for (const [dstr] of Array.from(map)) {
    const d = new Date(dstr);
    if (d.getDay() === 0) {
      let cur = nextDay(d);
      while (isHoliday(fmt(cur.getFullYear(), cur.getMonth() + 1, cur.getDate()))) {
        cur = nextDay(cur);
      }
      map.set(fmt(cur.getFullYear(), cur.getMonth() + 1, cur.getDate()), "振替休日");
    }
  }
  // 国民の休日
  const dates = Array.from(map.keys()).sort();
  for (let i = 0; i < dates.length - 1; i++) {
    const a = new Date(dates[i]);
    const b = new Date(dates[i + 1]);
    if ((b - a) / 86400000 === 2) {
      const mid = new Date(a.getFullYear(), a.getMonth(), a.getDate() + 1);
      const midStr = fmt(mid.getFullYear(), mid.getMonth() + 1, mid.getDate());
      if (!map.has(midStr) && mid.getDay() !== 0) map.set(midStr, "国民の休日");
    }
  }
  return map;
}

function buildMonthMatrix(year, month) {
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0).getDate();
  const pre = Array.from({ length: first.getDay() }, () => null);
  const days = Array.from({ length: last }, (_, i) => i + 1);
  const cells = [...pre, ...days];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

// UTF-8 Base64 decode
const b64decodeUtf8 = (b64) => {
  try {
    const utf8 = atob(b64);
    const json = decodeURIComponent(escape(utf8));
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const cmpDate = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

// クリップボードコピー（フォールバック付き）
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.top = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

/* ========= リッチボタン（インラインスタイル） ========= */
const luxBtn = (variant = "primary", disabled = false) => {
  const base = {
    appearance: "none",
    border: "0",
    outline: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    borderRadius: "9999px",
    padding: "10px 18px",
    fontWeight: 700,
    letterSpacing: "0.02em",
    transition: "transform .08s ease, box-shadow .2s ease, opacity .2s ease",
    boxShadow: disabled
      ? "none"
      : "0 6px 18px rgba(0,0,0,.18), inset 0 0 0 1px rgba(255,255,255,.08)",
    opacity: disabled ? 0.6 : 1,
    userSelect: "none",
    WebkitTapHighlightColor: "transparent",
  };
  const gradients = {
    primary: `linear-gradient(135deg, #004CA0 0%, #3b6fc7 60%, #FDB9C8 120%)`,
    pink: `linear-gradient(135deg, #FDB9C8 0%, #ff9fb4 40%, #004CA0 120%)`,
    dark: `linear-gradient(135deg, #111 0%, #2a2a2a 55%, #004CA0 120%)`,
    ghost: `linear-gradient(135deg, rgba(0,0,0,.02), rgba(0,0,0,.02))`,
  };
  const fg = variant === "ghost" ? "#111" : "#fff";
  return { ...base, background: gradients[variant] || gradients.primary, color: fg };
};

/* ========================= 本体 ========================= */
export default function PersonalSharePage() {
  const { token } = useParams(); // rec.id または 'bundle'
  const isBundle = token === "bundle"; // bundle は閲覧のみ

  const [events, setEvents] = useState([]); // {date,title,memo,allDay,slot,startTime,endTime}
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // カレンダー年月（イベントがあれば、最も早い日付の月を初期表示）
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  // 共有URL/短縮リンク
  const fullUrl = typeof window !== "undefined" ? window.location.href : "";
  const [shortUrl, setShortUrl] = useState("");
  const [shortening, setShortening] = useState(false);
  const [shortMsg, setShortMsg] = useState("");
  const [shortErr, setShortErr] = useState("");

  // ===== データ読み込み =====
  const loadSingleFromLocal = (recId) => {
    try {
      const all = JSON.parse(localStorage.getItem("personalRecords") || "[]");
      const rec = (Array.isArray(all) ? all : []).find((r) => r.id === recId);
      if (!rec) return [];
      return rec.items.map((it) => ({
        date: it.date,
        title: rec.title || "（無題）",
        memo: rec.memo || "",
        allDay: it.slot === "終日",
        slot: it.slot,
        startTime: typeof it.startHour === "number" ? `${pad(it.startHour)}:00` : null,
        endTime: typeof it.endHour === "number" ? `${pad(it.endHour)}:00` : null,
      }));
    } catch {
      return [];
    }
  };

  const loadBundleFromHash = () => {
    const h = (typeof window !== "undefined" ? window.location.hash : "") || "";
    const b64 = h.startsWith("#") ? h.slice(1) : h;
    const data = b64decodeUtf8(b64);
    if (!data || data.type !== "bundle" || !Array.isArray(data.events)) {
      throw new Error("共有データの形式が不正です。リンクを確認してください。");
    }
    return data.events;
  };

  useEffect(() => {
    setLoading(true);
    setLoadError("");
    try {
      let evs = [];
      if (isBundle) {
        evs = loadBundleFromHash();
      } else {
        evs = loadSingleFromLocal(token);
      }
      evs.sort((a, b) => cmpDate(a.date, b.date));
      setEvents(evs);

      // 初期表示月の決定
      if (evs.length > 0) {
        const d0 = new Date(evs[0].date);
        setYear(d0.getFullYear());
        setMonth(d0.getMonth() + 1);
      }
    } catch (e) {
      setLoadError(e?.message || "データを読み込めませんでした。");
    } finally {
      setLoading(false);
    }
  }, [token, isBundle]);

  // ===== カレンダー構築 =====
  const holidayMap = useMemo(() => buildJapaneseHolidays(year), [year]);
  const weeks = useMemo(() => buildMonthMatrix(year, month), [year, month]);

  // 日付 -> イベント配列
  const eventsByDate = useMemo(() => {
    const map = new Map();
    for (const e of events) {
      const key = e.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(e);
    }
    // 同日内は開始時間があれば時間順、なければタイトル順
    for (const [k, arr] of map) {
      arr.sort((a, b) => {
        const ta = a.startTime || "99:99";
        const tb = b.startTime || "99:99";
        if (ta !== tb) return ta < tb ? -1 : 1;
        return (a.title || "").localeCompare(b.title || "", "ja");
      });
    }
    return map;
  }, [events]);

  const prevMonth = () => {
    const d = new Date(year, month - 2, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
  };
  const nextMonth = () => {
    const d = new Date(year, month, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
  };

  const holidayName = (y, m, d) => holidayMap.get(fmt(y, m, d));
  const isToday = (d) => fmt(year, month, d) === todayStr;

  // スロットの見た目ラベル
  const slotBadge = (e) => {
    if (e.allDay) return "終日";
    if (e.slot === "昼" || e.slot === "夜" || e.slot === "✕") return e.slot;
    if (e.startTime && e.endTime) return `${e.startTime}〜${e.endTime}`;
    return e.slot || "";
  };

  // ====== 短縮リンク生成（堅牢化＋リトライ） ======
  const handleCreateShortLink = async () => {
    if (!fullUrl) return;
    if (!navigator.onLine) {
      setShortErr("オフラインのため短縮できません。ネットワーク接続を確認してください。");
      return;
    }
    setShortening(true);
    setShortErr("");
    setShortMsg("");

    const tryOnce = async (signal) => {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: fullUrl }),
        signal,
      });
      if (!res.ok) {
        let detail = "";
        try {
          const j = await res.json();
          detail = j?.error || j?.message || "";
        } catch {}
        throw new Error(detail || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const out =
        data?.shortUrl
          ? data.shortUrl
          : data?.code
          ? `${window.location.origin.replace(/\/$/, "")}/s/${data.code}`
          : "";
      if (!out) throw new Error("短縮結果が不正です");
      return out;
    };

    // タイムアウト付きで最大2回
    const withTimeout = (ms) => {
      const ctrl = new AbortController();
      const id = setTimeout(() => ctrl.abort(), ms);
      return { ctrl, id };
    };

    try {
      let out = "";
      for (let attempt = 1; attempt <= 2; attempt++) {
        const { ctrl, id } = withTimeout(8000);
        try {
          out = await tryOnce(ctrl.signal);
          clearTimeout(id);
          break;
        } catch (e) {
          clearTimeout(id);
          if (attempt === 2) throw e;
        }
      }
      setShortUrl(out);
      setShortMsg("短縮リンクを作成しました。");
      setTimeout(() => setShortMsg(""), 2000);
    } catch (e) {
      console.error(e);
      const msg =
        e?.name === "AbortError"
          ? "短縮リクエストがタイムアウトしました。時間をおいて再度お試しください。"
          : `短縮リンクの作成に失敗しました${e?.message ? `（${e.message}）` : ""}。`;
      setShortErr(msg);
    } finally {
      setShortening(false);
    }
  };

  const handleCopy = async (text) => {
    const ok = await copyToClipboard(text);
    setShortMsg(ok ? "コピーしました。" : "コピーに失敗しました。");
    setTimeout(() => setShortMsg(""), 1500);
  };

  // ===== ボタンの見た目（メモ化） =====
  const navBtnStyle = useMemo(() => luxBtn("dark", false), []);
  const shortenBtnStyle = useMemo(() => luxBtn("primary", shortening), [shortening]);
  const copyBtnStyle = useMemo(() => luxBtn("ghost", false), []);

  return (
    <div className="share-container">
      {/* タイトルを中央寄せ */}
      <h1 className="share-title" style={{ textAlign: "center" }}>
        {isBundle ? "共有日程（閲覧のみ）" : "共有日程"}
      </h1>

      {/* === 共有URL & 短縮リンク UI === */}
      <div className="share-link-box" style={{ maxWidth: 980, margin: "0 auto 12px" }}>
        <div
          className="share-link-row"
          style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}
        >
          <span className="share-link-label">共有URL：</span>
          <a
            className="share-link-url"
            href={fullUrl}
            target="_blank"
            rel="noreferrer"
            style={{ overflowWrap: "anywhere" }}
          >
            {fullUrl}
          </a>
          <button
            className="share-link-copy-btn"
            onClick={() => handleCopy(fullUrl)}
            style={copyBtnStyle}
          >
            コピー
          </button>
        </div>

        <div
          className="share-shorten-row"
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginTop: 6,
            flexWrap: "wrap",
          }}
        >
          <button
            className="shorten-btn"
            disabled={shortening}
            onClick={handleCreateShortLink}
            style={shortenBtnStyle}
            onMouseDown={(e) => !shortening && (e.currentTarget.style.transform = "translateY(1px)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            {shortening ? "⏳ 作成中..." : "短縮リンクを作成"}
          </button>
          {shortUrl && (
            <span className="short-url-wrap" style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
              <a
                className="short-url"
                href={shortUrl}
                target="_blank"
                rel="noreferrer"
                style={{ overflowWrap: "anywhere" }}
              >
                {shortUrl}
              </a>
              <button className="shorten-copy-btn" onClick={() => handleCopy(shortUrl)} style={copyBtnStyle}>
                コピー
              </button>
            </span>
          )}
        </div>

        {(shortMsg || shortErr) && (
          <div
            className={`shorten-message ${shortErr ? "error" : "ok"}`}
            style={{ marginTop: 6, fontWeight: 600 }}
          >
            {shortErr || shortMsg}
          </div>
        )}
      </div>

      {loading && <p className="muted" style={{ textAlign: "center" }}>読み込み中…</p>}
      {loadError && <p className="error" style={{ textAlign: "center" }}>{loadError}</p>}

      {!loading && !loadError && (
        <>
          {/* ======= TimeTree 風：中央寄せラッパ ======= */}
          <div className="tt-center" style={{ maxWidth: 980, margin: "0 auto" }}>
            {/* ===== 自作カレンダー（祝日対応） ===== */}
            <div className="calendar-container neo" style={{ marginBottom: 16 }}>
              {/* ヘッダーは中央揃え（左右にナビ） */}
              <div
                className="calendar-header"
                style={{
                  display: "grid",
                  gridTemplateColumns: "56px 1fr 56px",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <button
                  className="nav-circle"
                  onClick={prevMonth}
                  aria-label="前の月"
                  style={navBtnStyle}
                >
                  ‹
                </button>
                <span className="ym" style={{ textAlign: "center", fontWeight: 700 }}>
                  {year}年 {month}月
                </span>
                <button
                  className="nav-circle"
                  onClick={nextMonth}
                  aria-label="次の月"
                  style={navBtnStyle}
                >
                  ›
                </button>
              </div>

              <table className="calendar-table" style={{ margin: "0 auto" }}>
                <thead>
                  <tr>
                    {wdJP.map((w, i) => (
                      <th
                        key={w}
                        className={i === 0 ? "sunday" : i === 6 ? "saturday" : ""}
                        style={{ textAlign: "center" }}
                      >
                        {w}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {weeks.map((week, wi) => (
                    <tr key={wi}>
                      {week.map((d, di) => {
                        if (!d) return <td key={`e-${di}`} />;
                        const dateStr = fmt(year, month, d);
                        const hname = holidayName(year, month, d);
                        const dayEvents = eventsByDate.get(dateStr) || [];
                        const classes = [
                          "cell",
                          new Date(year, month - 1, d).getDay() === 0
                            ? "sunday"
                            : new Date(year, month - 1, d).getDay() === 6
                            ? "saturday"
                            : "",
                          hname ? "holiday" : "",
                          isToday(d) ? "today" : "",
                          dayEvents.length ? "has-events" : "",
                        ]
                          .filter(Boolean)
                          .join(" ");

                        return (
                          <td key={d} className={classes} style={{ verticalAlign: "top" }}>
                            {/* 日付は上部、全体は中央に近い見栄えへ */}
                            <div
                              className="daynum"
                              style={{ textAlign: "center", fontWeight: 700, marginBottom: 4 }}
                            >
                              {d}
                            </div>
                            {hname && (
                              <div
                                className="holiday-name"
                                style={{ textAlign: "center", opacity: 0.85 }}
                              >
                                {hname}
                              </div>
                            )}

                            {/* その日のイベント一覧（中央寄せ） */}
                            {dayEvents.length > 0 && (
                              <ul
                                className="day-events"
                                style={{
                                  listStyle: "none",
                                  padding: 0,
                                  margin: "6px 0 0",
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                {dayEvents.map((e, i) => (
                                  <li
                                    key={i}
                                    className="event-chip"
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 6,
                                      padding: "4px 8px",
                                      borderRadius: 999,
                                      background: "rgba(0,0,0,0.05)",
                                    }}
                                  >
                                    <span className="event-title" style={{ fontWeight: 600 }}>
                                      {e.title || "（無題）"}
                                    </span>
                                    <span
                                      className="event-badge"
                                      style={{
                                        fontSize: "0.8rem",
                                        padding: "2px 6px",
                                        borderRadius: 999,
                                        background: "rgba(0,76,160,0.1)",
                                      }}
                                    >
                                      {slotBadge(e)}
                                    </span>
                                    {e.memo ? (
                                      <span className="event-memo" style={{ opacity: 0.8 }}>
                                        （{e.memo}）
                                      </span>
                                    ) : null}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ===== 補助：一覧表示（中央寄せのまま） ===== */}
            <div className="share-table neo" style={{ padding: 12, margin: "0 auto" }}>
              {events.length === 0 ? (
                <p className="muted" style={{ textAlign: "center" }}>
                  共有された日程はありません。
                </p>
              ) : (
                <ul className="answered-list" style={{ maxWidth: 760, margin: "0 auto" }}>
                  {events.map((e, i) => (
                    <li
                      key={i}
                      className="answered-item"
                      style={{
                        padding: "6px 0",
                        borderBottom: "1px dashed rgba(0,0,0,0.1)",
                        display: "flex",
                        gap: 8,
                        justifyContent: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <strong>{e.date}</strong>
                      <span style={{ fontWeight: 600 }}>{e.title || "（無題）"}</span>
                      {e.memo ? <span className="muted">（{e.memo}）</span> : null}
                      <span className="muted">/ {slotBadge(e)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
