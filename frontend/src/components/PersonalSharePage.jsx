// frontend/src/components/PersonalSharePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "../common.css";
import "../personal.css";

/* ===== 共通ユーティリティ ===== */
const pad = (n) => String(n).padStart(2, "0");
const fmtDate = (iso) => {
  try {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    return `${y}/${m}/${day}`;
  } catch {
    return iso;
  }
};
const cmpDate = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

// UTF-8 Base64
const b64decodeUtf8 = (b64) => {
  try {
    const utf8 = atob(b64);
    const json = decodeURIComponent(escape(utf8));
    return JSON.parse(json);
  } catch {
    return null;
  }
};

/* ===== 回答保存ストレージ =====
   キー: mp_share_answers_<token>
   形式: { name: string, answers: { [date:string]: '◯'|'✖' } }
================================= */
const loadAnswers = (token) => {
  try {
    const raw = localStorage.getItem(`mp_share_answers_${token}`);
    return raw ? JSON.parse(raw) : { name: "", answers: {} };
  } catch {
    return { name: "", answers: {} };
  }
};
const saveAnswers = (token, obj) => {
  try {
    localStorage.setItem(`mp_share_answers_${token}`, JSON.stringify(obj));
  } catch {}
};

export default function PersonalSharePage() {
  const { token } = useParams(); // rec.id または 'bundle'
  const [events, setEvents] = useState([]); // {date,title,memo,allDay,slot,startTime,endTime}
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // 回答状態
  const [name, setName] = useState("");
  const [answers, setAnswers] = useState({}); // date -> '◯' | '✖'

  // 既存の単体共有モード: localStorage から rec.id に該当するイベントを抽出
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

  // バンドル共有モード: location.hash の Base64 をデコード
  const loadBundleFromHash = () => {
    const h = (typeof window !== "undefined" ? window.location.hash : "") || "";
    const b64 = h.startsWith("#") ? h.slice(1) : h;
    const data = b64decodeUtf8(b64);
    if (!data || data.type !== "bundle" || !Array.isArray(data.events)) {
      throw new Error("共有データの形式が不正です。リンクを確認してください。");
    }
    return data.events;
  };

  // 起動時ロード
  useEffect(() => {
    setLoading(true);
    setLoadError("");

    try {
      let evs = [];
      if (token === "bundle") {
        evs = loadBundleFromHash();
      } else {
        evs = loadSingleFromLocal(token);
      }
      // 日付昇順
      evs.sort((a, b) => cmpDate(a.date, b.date));
      setEvents(evs);
    } catch (e) {
      setLoadError(e?.message || "データを読み込めませんでした。");
    } finally {
      setLoading(false);
    }

    // 回答の復元
    const saved = loadAnswers(token);
    setName(saved.name || "");
    setAnswers(saved.answers || {});
  }, [token]);

  const onChangeAnswer = (d, v) => {
    setAnswers((prev) => ({ ...prev, [d]: v }));
  };

  const onSave = () => {
    const payload = { name: name || "", answers };
    saveAnswers(token, payload);
  };

  // 表示用まとめ
  const grouped = useMemo(() => {
    // 同日複数タイトルがある想定で、date を主キーに配列化
    const map = new Map();
    for (const e of events) {
      if (!map.has(e.date)) map.set(e.date, []);
      map.get(e.date).push(e);
    }
    return Array.from(map.entries()).sort((a, b) => cmpDate(a[0], b[0]));
  }, [events]);

  return (
    <div className="share-container">
      <header className="header">
        <div className="brand">
          <Link to="/" className="brand-link">MilkPOP Calendar</Link>
        </div>
        <nav className="nav">
          <Link to="/personal" className="nav-link">個人スケジュール</Link>
          <Link to="/register" className="nav-link">日程登録ページ</Link>
        </nav>
      </header>

      <h1 className="share-title">共有日程（閲覧＆回答）</h1>

      {loading && <p className="muted">読み込み中…</p>}
      {loadError && <p className="error">{loadError}</p>}

      {!loading && !loadError && (
        <>
          <div className="answer-box neo" style={{ marginBottom: 16 }}>
            <label className="muted" style={{ display: "block", marginBottom: 6 }}>
              あなたの名前（任意）
            </label>
            <input
              className="title-input"
              placeholder="お名前を入力"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ maxWidth: 420 }}
            />
          </div>

          {/* 日付ごとの回答表（左寄せ・レスポンシブ） */}
          <div className="share-table neo" style={{ padding: 12 }}>
            {grouped.length === 0 && <p className="muted">共有された日程はありません。</p>}

            {grouped.map(([d, arr]) => (
              <div key={d} className="share-row" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, padding: "10px 8px", borderBottom: "1px dashed rgba(0,0,0,0.15)" }}>
                <div>
                  <div className="share-date" style={{ fontWeight: 700, marginBottom: 6 }}>
                    {fmtDate(d)}
                  </div>
                  <ul className="share-events" style={{ margin: 0, paddingLeft: 16 }}>
                    {arr.map((e, i) => (
                      <li key={i} style={{ marginBottom: 4 }}>
                        <span style={{ fontWeight: 600 }}>{e.title}</span>
                        {e.memo ? <span className="muted">（{e.memo}）</span> : null}
                        <span className="muted" style={{ marginLeft: 6 }}>
                          / {e.slot}
                          {e.startTime && e.endTime ? ` ${e.startTime}〜${e.endTime}` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <label className="muted" style={{ display: "block", marginBottom: 4 }}>
                    回答
                  </label>
                  <select
                    className="cute-select"
                    value={answers[d] || ""}
                    onChange={(e) => onChangeAnswer(d, e.target.value)}
                  >
                    <option value=""></option>
                    <option value="◯">◯</option>
                    <option value="✖">✖</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="card-actions" style={{ marginTop: 12 }}>
            <button className="ghost-btn primary" onClick={onSave}>保存</button>
          </div>

          {/* 即時プレビュー */}
          <div className="answered-box neo" style={{ marginTop: 16 }}>
            <h3 style={{ marginTop: 0 }}>あなたの回答（即時反映）</h3>
            {Object.keys(answers).length === 0 ? (
              <p className="muted">まだ回答がありません。</p>
            ) : (
              <ul className="answered-list">
                {Object.entries(answers)
                  .sort((a, b) => cmpDate(a[0], b[0]))
                  .map(([d, v]) => (
                    <li key={d} className="answered-item" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, padding: "6px 0", borderBottom: "1px dashed rgba(0,0,0,0.1)" }}>
                      <span>{fmtDate(d)}</span>
                      <strong>{v}</strong>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
