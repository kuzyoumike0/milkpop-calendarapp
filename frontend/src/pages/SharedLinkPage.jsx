import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const SLOT_OPTIONS = ["全日", "朝", "昼", "夜", "中締め"];

// ---- Mini Calendar (自作カレンダー) ----
function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function fmt(d) {
  return d.toISOString().slice(0, 10);
}

function MiniCalendar({ value, onChange }) {
  const jsDate = useMemo(() => new Date(value + "T00:00:00"), [value]);
  const [cursor, setCursor] = useState(startOfMonth(jsDate));

  useEffect(() => {
    // 同じ月を指していない場合はカーソルを選択日の月へ
    const d = new Date(value + "T00:00:00");
    if (d.getFullYear() !== cursor.getFullYear() || d.getMonth() !== cursor.getMonth()) {
      setCursor(startOfMonth(d));
    }
  }, [value]); // eslint-disable-line

  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const startWeekday = monthStart.getDay(); // 0=Sun
  const daysInMonth = monthEnd.getDate();

  // グリッド用日付配列（前月の埋めも含む）
  const cells = [];
  const firstCellDate = new Date(monthStart);
  firstCellDate.setDate(monthStart.getDate() - startWeekday);
  for (let i = 0; i < 42; i++) {
    const cell = new Date(firstCellDate);
    cell.setDate(firstCellDate.getDate() + i);
    cells.push(cell);
  }

  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const selected = new Date(value + "T00:00:00");

  return (
    <div style={{ border: "1px solid #eee", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: ".5rem 1rem", background: "#fafafa" }}>
        <button
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          style={{ border: "1px solid #ddd", background: "#fff", borderRadius: 8, padding: ".25rem .5rem", cursor: "pointer" }}
        >
          ◀
        </button>
        <strong>{cursor.getFullYear()}年 {cursor.getMonth() + 1}月</strong>
        <button
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          style={{ border: "1px solid #ddd", background: "#fff", borderRadius: 8, padding: ".25rem .5rem", cursor: "pointer" }}
        >
          ▶
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, padding: 8 }}>
        {["日","月","火","水","木","金","土"].map((w) => (
          <div key={w} style={{ textAlign: "center", fontSize: ".85rem", color: "#666" }}>{w}</div>
        ))}
        {cells.map((d) => {
          const inMonth = d.getMonth() === cursor.getMonth();
          const selectedFlag = isSameDay(d, selected);
          return (
            <button
              key={d.toISOString()}
              onClick={() => onChange(fmt(d))}
              style={{
                height: 40,
                borderRadius: 10,
                border: selectedFlag ? "2px solid #ff6f61" : "1px solid #eee",
                background: selectedFlag ? "#ffe9e6" : "#fff",
                color: inMonth ? "#333" : "#bbb",
                cursor: "pointer"
              }}
              title={fmt(d)}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---- SharedLinkPage ----
export default function SharedLinkPage() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [selectMode, setSelectMode] = useState("single"); // 'single' | 'multi'
  const [slotSingle, setSlotSingle] = useState("全日");
  const [slotMulti, setSlotMulti] = useState(["全日"]);

  // URL: /shared/:shareId を想定
  const segments = window.location.pathname.split("/").filter(Boolean);
  const shareId = segments[segments.length - 1] || "demo";

  const fetchEvents = async () => {
    const res = await axios.get(`/api/shared/${shareId}/events`, { params: { date } });
    setEvents(res.data);
  };

  useEffect(() => { fetchEvents(); /* eslint-disable-next-line */ }, [date]);

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
      slots: selectMode === "single" ? slotSingle : slotMulti,
    };
    try {
      await axios.post(`/api/shared/${shareId}/events`, payload);
      setTitle("");
      if (selectMode === "multi") setSlotMulti(["全日"]);
      else setSlotSingle("全日");
      await fetchEvents();
    } catch (err) {
      console.error(err);
      alert("登録に失敗しました");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("この予定を削除しますか？")) return;
    try {
      await axios.delete(`/api/shared/${shareId}/events/${id}`);
      await fetchEvents();
    } catch (e) {
      console.error(e);
      alert("削除に失敗しました");
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
          maxWidth: 980,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "340px 1fr",
          gap: "1rem",
        }}
      >
        {/* 左：自作カレンダー */}
        <div>
          <h2 style={{ color: "#ff6f61", margin: "0 0 .5rem" }}>自作カレンダー</h2>
          <MiniCalendar value={date} onChange={setDate} />
        </div>

        {/* 右：共有スケジュール */}
        <div
          style={{
            background: "#fff",
            padding: "1.5rem",
            borderRadius: "16px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
          }}
        >
          <h1 style={{ textAlign: "left", color: "#ff6f61", marginTop: 0 }}>共有スケジュール</h1>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
            <label style={{ whiteSpace: "nowrap" }}>日付</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                padding: "0.5rem",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
            />
          </div>

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

            {/* ラジオボタンで「範囲選択 or 複数選択」を切替 */}
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
                範囲選択（単一）
              </label>
              <label>
                <input
                  type="radio"
                  name="mode"
                  value="multi"
                  checked={selectMode === "multi"}
                  onChange={() => setSelectMode("multi")}
                />
                複数選択（チェック）
              </label>
            </div>

            {/* 単一（ラジオ） */}
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

            {/* 複数（チェック） */}
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
          {/* 当日の予定も削除できるように削除ボタンを設置 */}
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
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <div>
                    <strong style={{ color: "#444" }}>{ev.title}</strong>
                    <span style={{ marginLeft: ".5rem", color: "#888" }}>
                      （{(ev.slots || ["全日"]).join("・")}）
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(ev.id)}
                    style={{ border: "1px solid #e57373", background: "#ffebee", color: "#c62828", borderRadius: 8, padding: ".4rem .7rem", cursor: "pointer" }}
                    title="この予定を削除"
                  >
                    削除
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}