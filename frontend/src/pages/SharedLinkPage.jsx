import React, { useEffect, useState } from "react";
import axios from "axios";

const SLOT_OPTIONS = ["全日", "朝", "昼", "夜", "中締め"];

export default function SharedLinkPage() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [selectMode, setSelectMode] = useState("single");
  const [slotSingle, setSlotSingle] = useState("全日");
  const [slotMulti, setSlotMulti] = useState(["全日"]);

  const segments = window.location.pathname.split("/").filter(Boolean);
  const shareId = segments[segments.length - 1] || "demo";

  const fetchEvents = async () => {
    const res = await axios.get(`/api/shared/${shareId}/events`, { params: { date } });
    setEvents(res.data);
  };

  useEffect(() => {
    fetchEvents();
  }, [date]);

  const toggleMulti = (label) => {
    setSlotMulti((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("タイトルを入力してください");
      return;
    }
    const payload = {
      eventDate: date,
      title: title.trim(),
      memo: memo || "",
      slots: selectMode === "single" ? slotSingle : slotMulti,
    };
    try {
      await axios.post(`/api/shared/${shareId}/events`, payload);
      setTitle("");
      setMemo("");
      if (selectMode === "multi") setSlotMulti(["全日"]);
      else setSlotSingle("全日");
      await fetchEvents();
    } catch (err) {
      console.error(err);
      alert("登録に失敗しました");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "2rem",
        background: "linear-gradient(135deg, #fceabb 0%, #f8b500 100%)",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
      }}
    >
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          background: "#fff",
          padding: "2rem",
          borderRadius: "16px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#ff6f61",
            marginBottom: "1.5rem",
          }}
        >
          共有スケジュール
        </h1>

        <label>日付</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{
            display: "block",
            padding: "0.5rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
            marginBottom: "1rem",
          }}
        />

        <form onSubmit={handleSubmit}>
          <div>
            <label>タイトル（必須）</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例：打ち合わせ"
              required
              style={{
                width: "100%",
                padding: ".75rem",
                borderRadius: "8px",
                border: "1px solid #ddd",
                marginTop: ".25rem",
                marginBottom: "1rem",
              }}
            />
          </div>

          <div>
            <label>メモ（任意）</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              style={{
                width: "100%",
                minHeight: "80px",
                padding: ".75rem",
                borderRadius: "8px",
                border: "1px solid #ddd",
                marginTop: ".25rem",
                marginBottom: "1rem",
              }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ marginRight: "1rem" }}>選択方式：</label>
            <label style={{ marginRight: "1rem" }}>
              <input
                type="radio"
                name="mode"
                value="single"
                checked={selectMode === "single"}
                onChange={() => setSelectMode("single")}
              />
              単一（ラジオ）
            </label>
            <label>
              <input
                type="radio"
                name="mode"
                value="multi"
                checked={selectMode === "multi"}
                onChange={() => setSelectMode("multi")}
              />
              複数（チェック）
            </label>
          </div>

          {selectMode === "single" && (
            <div style={{ marginBottom: "1rem" }}>
              {SLOT_OPTIONS.map((label) => (
                <label key={label} style={{ marginRight: "1rem" }}>
                  <input
                    type="radio"
                    name="slotSingle"
                    value={label}
                    checked={slotSingle === label}
                    onChange={() => setSlotSingle(label)}
                  />
                  {label}
                </label>
              ))}
            </div>
          )}

          {selectMode === "multi" && (
            <div style={{ marginBottom: "1rem" }}>
              {SLOT_OPTIONS.map((label) => (
                <label key={label} style={{ marginRight: "1rem" }}>
                  <input
                    type="checkbox"
                    checked={slotMulti.includes(label)}
                    onChange={() => toggleMulti(label)}
                  />
                  {label}
                </label>
              ))}
            </div>
          )}

          <button
            type="submit"
            style={{
              background: "#ff6f61",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: ".75rem 1.5rem",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "background 0.3s",
            }}
            onMouseOver={(e) => (e.target.style.background = "#e65a50")}
            onMouseOut={(e) => (e.target.style.background = "#ff6f61")}
          >
            登録する
          </button>
        </form>

        <h2 style={{ marginTop: "2rem", color: "#333" }}>{date} の予定</h2>
        {events.length === 0 ? (
          <p>登録された予定はありません。</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {events.map((ev) => (
              <li
                key={ev.id}
                style={{
                  background: "#fafafa",
                  margin: ".5rem 0",
                  padding: ".75rem",
                  borderRadius: "8px",
                  border: "1px solid #eee",
                }}
              >
                <strong style={{ color: "#444" }}>{ev.title}</strong>
                <span style={{ marginLeft: ".5rem", color: "#888" }}>
                  （{(ev.slots || ["全日"]).join("・")}）
                </span>
                {ev.memo ? (
                  <div style={{ fontSize: ".9em", color: "#666", marginTop: ".25rem" }}>
                    {ev.memo}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
