// frontend/src/components/PersonalPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
// 読み込み順：common → personal（personalが最終で上書き）
import "../common.css";
import "../personal.css";

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

  // 画面用：単日/範囲/複数の見た目切替（仕様は維持）
  const [selectMode, setSelectMode] = useState("single"); // single | range | multi

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
          const url = `${window.location.origin}/personal/share/${data.share.token}`;
          setShareInfo({ url, token: data.share.token, title: data.title || "個人スケジュール" });
        }
      } catch {
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

  const onChangeDraft = (k, v) => setDraft((d) => ({ ...d, [k]: v }));

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
      const url = `${window.location.origin}/personal/share/${data.token}`;
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

  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const copyShareUrl = async () => {
    if (!shareInfo?.url) return;
    try {
      await navigator.clipboard.writeText(shareInfo.url);
      alert("共有URLをコピーしました");
    } catch { /* noop */ }
  };

  return (
    <div className="personal-page">
      {/* ヘッダー（バナー＆ナビ） */}
      <div className="page-header">
        <h1 className="brand">MilkPOP Calendar</h1>
        <div className="breadcrumbs">
          <Link to="/" className="nav-pill">トップ</Link>
          <Link to="/register" className="nav-pill">日程登録</Link>
          <Link to="/share" className="nav-pill">日程共有</Link>
          <Link to="/personal" className="nav-pill active">個人日程登録</Link>
        </div>
        <div className="header-actions">
          {shareInfo ? (
            <div className="share-compact">
              <input className="share-compact-input" value={shareInfo.url} readOnly onFocus={(e)=>e.currentTarget.select()} />
              <button className="btn outline" onClick={copyShareUrl}>コピー</button>
              <Link className="btn primary" to={`/personal/share/${shareInfo.token}`} target="_blank" rel="noreferrer">共有を表示</Link>
            </div>
          ) : (
            <button className="btn primary" onClick={issueShareLink} disabled={busy}>共有リンクを発行</button>
          )}
        </div>
      </div>

      {/* タイトル（中央入力） */}
      <h2 className="ppage-title">個人日程登録</h2>
      <div className="title-input-wrap">
        <input
          className="title-input"
          type="text"
          placeholder="タイトルを入力してください"
          value={draft.title}
          onChange={(e)=>onChangeDraft("title", e.target.value)}
        />
      </div>

      {/* モード切替（単日/範囲/複数） */}
      <div className="mode-toggle">
        <button
          className={`pill ${selectMode === "single" ? "active" : ""}`}
          onClick={()=>setSelectMode("single")}
          type="button"
        >単日選択</button>
        <button
          className={`pill ${selectMode === "range" ? "active" : ""}`}
          onClick={()=>setSelectMode("range")}
          type="button"
        >範囲選択</button>
        <button
          className={`pill ${selectMode === "multi" ? "active" : ""}`}
          onClick={()=>setSelectMode("multi")}
          type="button"
        >複数選択</button>
      </div>

      {/* 2カラム：左カレンダー／右サイドパネル */}
      <div className="ppage-grid">
        {/* 左：カレンダー（ここに自作カレンダーを描画する想定。date input で代替も可） */}
        <div className="calendar-card neo-card">
          <div className="calendar-head" />
          <div className="calendar-body">
            {/* 既存仕様に合わせて date input も残します */}
            <div className="fallback-date-row">
              <label>日付</label>
              <input
                type="date"
                value={draft.date}
                onChange={(e)=>onChangeDraft("date", e.target.value)}
              />
            </div>
            <div id="personal-calendar" className="calendar-placeholder">
              {/* ここにカレンダーUIを入れてOK（祝日マーキングもここで） */}
              <p className="muted">（ここに自作カレンダーが入ります）</p>
            </div>
          </div>
        </div>

        {/* 右：選択中の日程（メモ・時間帯・登録） */}
        <div className="side-card neo-card">
          <h3 className="side-title">選択中の日程</h3>

          <div className="side-row">
            <label>日付</label>
            <input type="text" className="side-input" value={draft.date ? fmtDate(draft.date) : "未選択"} readOnly />
          </div>

          <div className="side-row">
            <label>メモ</label>
            <textarea
              className="side-textarea"
              placeholder="メモを入力してください"
              value={draft.memo}
              onChange={(e)=>onChangeDraft("memo", e.target.value)}
            />
          </div>

          <div className="side-row">
            <label>時間帯</label>
            <div className="slot-pills">
              <button className={`slot ${draft.slot==="allDay"?"active":""}`} onClick={()=>onChangeDraft("slot","allDay")} type="button">終日</button>
              <button className={`slot ${draft.slot==="day"?"active":""}`} onClick={()=>onChangeDraft("slot","day")} type="button">昼</button>
              <button className={`slot ${draft.slot==="night"?"active":""}`} onClick={()=>onChangeDraft("slot","night")} type="button">夜</button>
              <button className={`slot ${draft.slot==="custom"?"active":""}`} onClick={()=>onChangeDraft("slot","custom")} type="button">カスタム</button>
            </div>
          </div>

          {draft.slot === "custom" && (
            <div className="time-range">
              <div className="time-col">
                <label>開始</label>
                <input type="time" value={draft.startTime} onChange={(e)=>onChangeDraft("startTime", e.target.value)} />
              </div>
              <div className="time-col">
                <label>終了</label>
                <input type="time" value={draft.endTime} onChange={(e)=>onChangeDraft("endTime", e.target.value)} />
              </div>
            </div>
          )}

          {err && <div className="error">{err}</div>}

          <button className="register-btn" onClick={addEvent} disabled={!canSave || busy}>登録</button>
        </div>
      </div>

      {/* 保存済み一覧 */}
      <div className="saved-wrap">
        <h3 className="saved-title">あなたの個人日程（保存済み）</h3>
        {events.length === 0 ? (
          <p className="muted">まだ登録はありません。</p>
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
                    </div>
                    {ev.memo && <p className="event-memo">{ev.memo}</p>}
                  </div>
                  <div className="event-actions">
                    <button className="btn danger outline" onClick={() => removeEvent(idx)} disabled={busy}>削除</button>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>

      {/* 自分の共有リンク一覧（仕様維持） */}
      <div className="links-wrap">
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
      </div>
    </div>
  );
}
