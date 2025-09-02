// frontend/src/components/PersonalPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../personal.css";
import "../common.css";

const emptyEvent = () => ({
  date: "",
  title: "",
  memo: "",
  allDay: true,
  slot: "allDay", // allDay | day | night | custom
  startTime: "",
  endTime: "",
  tags: [],
});

const fmtDate = (iso) => {
  try {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}/${m}/${day}`;
  } catch {
    return iso;
  }
};

export default function PersonalPage() {
  const [events, setEvents] = useState([]);
  const [draft, setDraft] = useState(emptyEvent());
  const [links, setLinks] = useState([]); // 外部共有用（URL+タイトル）
  const [shareInfo, setShareInfo] = useState(null); // {url, token, title}
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // 初期ロード：自分の個人予定とリンク
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/personal/me");
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        if (!alive) return;
        setEvents(Array.isArray(data.events) ? data.events : []);
        setLinks(Array.isArray(data.links) ? data.links : []);
        if (data.share && data.share.token) {
          const url = `${window.location.origin}/personal/view/${data.share.token}`;
          setShareInfo({ url, token: data.share.token, title: data.title || "個人スケジュール" });
        }
      } catch {
        // 未ログイン or 初回は空
        setEvents([]);
        setLinks([]);
      }
    })();
    return () => { alive = false; };
  }, []);

  const canSave = useMemo(() => {
    if (!draft.date) return false;
    if (!draft.title) return false;
    if (draft.slot === "custom") {
      if (!draft.startTime || !draft.endTime) return false;
    }
    return true;
  }, [draft]);

  const onChangeDraft = (k, v) => {
    setDraft((d) => ({ ...d, [k]: v }));
  };

  const addEvent = async () => {
    if (!canSave) return;
    setBusy(true); setErr("");
    try {
      const res = await fetch("/api/personal/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error("保存に失敗しました");
      const saved = await res.json();
      setEvents((prev) => [...prev, saved]);
      setDraft(emptyEvent());
    } catch (e) {
      setErr(e.message || "保存に失敗しました");
    } finally {
      setBusy(false);
    }
  };

  const removeEvent = async (idx) => {
    const target = events[idx];
    if (!target) return;
    setBusy(true); setErr("");
    try {
      const res = await fetch(`/api/personal/events/${encodeURIComponent(target.id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error("削除に失敗しました");
      setEvents((prev) => prev.filter((_, i) => i !== idx));
    } catch (e) {
      setErr(e.message || "削除に失敗しました");
    } finally {
      setBusy(false);
    }
  };

  const issueShareLink = async () => {
    setBusy(true); setErr("");
    try {
      const res = await fetch("/api/personal/share", { method: "POST" });
      if (!res.ok) throw new Error("共有リンクの発行に失敗しました（ログインが必要です）");
      const data = await res.json();
      const url = `${window.location.origin}/personal/view/${data.token}`;
      setShareInfo({ url, token: data.token, title: data.title || "個人スケジュール" });
    } catch (e) {
      setErr(e.message || "共有リンクの発行に失敗しました");
    } finally {
      setBusy(false);
    }
  };

  const addExternalLink = async (title, url) => {
    setBusy(true); setErr("");
    try {
      const res = await fetch("/api/personal/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, url }),
      });
      if (!res.ok) throw new Error("リンクの追加に失敗しました");
      const saved = await res.json();
      setLinks((prev) => [...prev, saved]);
    } catch (e) {
      setErr(e.message || "リンクの追加に失敗しました");
    } finally {
      setBusy(false);
    }
  };

  // 外部リンク入力
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const copyShareUrl = async () => {
    if (!shareInfo?.url) return;
    try {
      await navigator.clipboard.writeText(shareInfo.url);
      alert("共有URLをコピーしました");
    } catch {
      // no-op
    }
  };

  return (
    <div className="personal-page">
      <div className="page-header">
        <h1 className="brand">MilkPOP Calendar</h1>
        <div className="breadcrumbs">
          <Link to="/" className="nav-pill">トップ</Link>
          <Link to="/register" className="nav-pill">日程登録</Link>
          <Link to="/share" className="nav-pill">日程共有</Link>
        </div>
      </div>

      <div className="card glass">
        <div className="card-header">
          <h2 className="card-title">個人スケジュール（作成・管理）</h2>
        </div>

        {/* 共有リンク（予定が0件でも発行可能） */}
        <section className="section">
          <h3 className="section-title">閲覧用 共有リンク</h3>
          {shareInfo ? (
            <div className="share-box">
              <input
                className="share-url"
                value={shareInfo.url}
                readOnly
                onFocus={(e) => e.currentTarget.select()}
              />
              <button className="btn outline" onClick={copyShareUrl}>コピー</button>
              <Link className="btn primary" to={`/personal/view/${shareInfo.token}`} target="_blank" rel="noreferrer">
                閲覧ページを開く
              </Link>
            </div>
          ) : (
            <button className="btn primary" onClick={issueShareLink} disabled={busy}>
              共有リンクを発行
            </button>
          )}
          <p className="muted small">
            ※ ログインしていれば、まだ予定が無くても発行できます。
          </p>
        </section>

        {/* 予定登録フォーム */}
        <section className="section">
          <h3 className="section-title">予定の追加</h3>
          {err && <div className="error">{err}</div>}
          <div className="form-grid">
            <div className="form-row">
              <label>日付</label>
              <input
                type="date"
                value={draft.date}
                onChange={(e) => onChangeDraft("date", e.target.value)}
              />
            </div>
            <div className="form-row">
              <label>タイトル</label>
              <input
                type="text"
                placeholder="例：打ち合わせ"
                value={draft.title}
                onChange={(e) => onChangeDraft("title", e.target.value)}
              />
            </div>
            <div className="form-row">
              <label>メモ</label>
              <textarea
                placeholder="補足メモ（任意）"
                value={draft.memo}
                onChange={(e) => onChangeDraft("memo", e.target.value)}
              />
            </div>

            <div className="form-row">
              <label>時間帯</label>
              <div className="radio-row">
                <label><input
                  type="radio"
                  name="slot"
                  checked={draft.slot === "allDay"}
                  onChange={() => onChangeDraft("slot", "allDay")}
                /> 終日</label>
                <label><input
                  type="radio"
                  name="slot"
                  checked={draft.slot === "day"}
                  onChange={() => onChangeDraft("slot", "day")}
                /> 昼</label>
                <label><input
                  type="radio"
                  name="slot"
                  checked={draft.slot === "night"}
                  onChange={() => onChangeDraft("slot", "night")}
                /> 夜</label>
                <label><input
                  type="radio"
                  name="slot"
                  checked={draft.slot === "custom"}
                  onChange={() => onChangeDraft("slot", "custom")}
                /> 時間指定</label>
              </div>
            </div>

            {draft.slot === "custom" && (
              <>
                <div className="form-row">
                  <label>開始</label>
                  <input
                    type="time"
                    value={draft.startTime}
                    onChange={(e) => onChangeDraft("startTime", e.target.value)}
                  />
                </div>
                <div className="form-row">
                  <label>終了</label>
                  <input
                    type="time"
                    value={draft.endTime}
                    onChange={(e) => onChangeDraft("endTime", e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="form-actions">
              <button className="btn primary" onClick={addEvent} disabled={!canSave || busy}>
                追加
              </button>
            </div>
          </div>
        </section>

        {/* 登録済みの予定一覧（即時反映） */}
        <section className="section">
          <h3 className="section-title">登録済みの予定</h3>
          {events.length === 0 ? (
            <p className="muted">まだ予定がありません。</p>
          ) : (
            <ul className="event-list">
              {events
                .slice()
                .sort((a, b) => (a.date || "").localeCompare(b.date || ""))
                .map((ev, idx) => (
                  <li key={ev.id || idx} className="event-item">
                    <div className="event-date">{fmtDate(ev.date)}</div>
                    <div className="event-main">
                      <div className="event-title">{ev.title || "（無題）"}</div>
                      <div className="event-meta">
                        <span className="chip">
                          {ev.allDay ? "終日" :
                            ev.slot === "night" ? "夜" :
                            ev.slot === "day" ? "昼" :
                            (ev.startTime && ev.endTime) ? `${ev.startTime} - ${ev.endTime}` : "時間未設定"}
                        </span>
                        {Array.isArray(ev.tags) && ev.tags.length > 0 && (
                          <span className="chip outline">{ev.tags.join(" / ")}</span>
                        )}
                      </div>
                      {ev.memo && <p className="event-memo">{ev.memo}</p>}
                    </div>
                    <div className="event-actions">
                      <button className="btn danger outline" onClick={() => removeEvent(idx)} disabled={busy}>
                        削除
                      </button>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </section>

        {/* 自分が入力した 共有リンク（URL + タイトル）一覧 */}
        <section className="section">
          <h3 className="section-title">自分の共有リンク一覧</h3>
          <div className="form-grid compact">
            <div className="form-row">
              <label>タイトル</label>
              <input
                type="text"
                placeholder="例：案件Aの共有カレンダー"
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
              />
            </div>
            <div className="form-row">
              <label>URL</label>
              <input
                type="url"
                placeholder="https://example.com/..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>
            <div className="form-actions">
              <button
                className="btn"
                onClick={() => {
                  if (!linkUrl) return;
                  addExternalLink(linkTitle, linkUrl);
                  setLinkTitle("");
                  setLinkUrl("");
                }}
                disabled={busy}
              >
                追加
              </button>
            </div>
          </div>

          {links.length === 0 ? (
            <p className="muted">追加された共有リンクはありません。</p>
          ) : (
            <ul className="link-list">
              {links.map((lk, i) => (
                <li key={i} className="link-item">
                  <a href={lk.url} target="_blank" rel="noreferrer" className="cool-link">
                    {lk.title || lk.url}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
