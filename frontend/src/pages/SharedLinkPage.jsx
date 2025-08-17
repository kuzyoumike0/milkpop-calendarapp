import React, { useState, useEffect } from "react";
import axios from "axios";

// 日本の祝日一覧（2025年）
const holidays2025 = {
  "2025-01-01": "元日",
  "2025-01-13": "成人の日",
  "2025-02-11": "建国記念の日",
  "2025-02-23": "天皇誕生日",
  "2025-02-24": "振替休日",
  "2025-03-20": "春分の日",
  "2025-04-29": "昭和の日",
  "2025-05-03": "憲法記念日",
  "2025-05-04": "みどりの日",
  "2025-05-05": "こどもの日",
  "2025-05-06": "振替休日",
  "2025-07-21": "海の日",
  "2025-08-11": "山の日",
  "2025-09-15": "敬老の日",
  "2025-09-23": "秋分の日",
  "2025-10-13": "スポーツの日",
  "2025-11-03": "文化の日",
  "2025-11-23": "勤労感謝の日",
  "2025-11-24": "振替休日",
};

function formatDate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function SharedLinkPage() {
  const [date, setDate] = useState(formatDate(new Date()));
  const [title, setTitle] = useState("");
  const [selectMode, setSelectMode] = useState("single");

  const shareId = "demo";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await axios.post(`/api/shared/${shareId}/events`, {
      eventDate: date,
      title: title.trim(),
      slots: ["全日"],
    });
    setTitle("");
  };

  // 今日
  const today = new Date();
  const todayStr = formatDate(today);

  // 月カレンダー生成
  const year = parseInt(date.split("-")[0]);
  const month = parseInt(date.split("-")[1]);
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const weeks = [];
  let current = new Date(firstDay);
  current.setDate(current.getDate() - current.getDay()); // Sunday start

  while (current <= lastDay || current.getDay() !== 0) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      const dStr = formatDate(current);
      const isToday = dStr === todayStr;
      const holiday = holidays2025[dStr];
      week.push({
        date: new Date(current),
        str: dStr,
        isToday,
        holiday,
        inMonth: current.getMonth() + 1 === month,
      });
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto", padding: "1rem" }}>
      <h1 style={{ textAlign: "center", color: "#ff6f61" }}>共有カレンダー</h1>

      <div style={{ display: "flex", justifyContent: "center", margin: "1rem" }}>
        <label>
          <input
            type="radio"
            name="mode"
            value="single"
            checked={selectMode === "single"}
            onChange={() => setSelectMode("single")}
          />
          単一選択
        </label>
        <label style={{ marginLeft: "1rem" }}>
          <input
            type="radio"
            name="mode"
            value="multi"
            checked={selectMode === "multi"}
            onChange={() => setSelectMode("multi")}
          />
          複数選択
        </label>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              {["日","月","火","水","木","金","土"].map((d) => (
                <th key={d} style={{ padding: "0.5rem", borderBottom: "1px solid #ddd" }}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, wi) => (
              <tr key={wi}>
                {week.map((day, di) => (
                  <td
                    key={di}
                    style={{
                      padding: "0.5rem",
                      textAlign: "center",
                      background: day.isToday
                        ? "#ffeb3b"
                        : day.holiday
                        ? "#ffcdd2"
                        : day.inMonth
                        ? "#fff"
                        : "#f5f5f5",
                      color: day.date.getDay() === 0 ? "red" : day.date.getDay() === 6 ? "blue" : "black",
                    }}
                  >
                    {day.date.getDate()}
                    {day.holiday && <div style={{ fontSize: "0.7rem" }}>{day.holiday}</div>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={handleSubmit} style={{ marginTop: "1rem", textAlign: "center" }}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ padding: ".5rem", marginRight: "1rem" }}
        />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="予定を入力"
          style={{ padding: ".5rem", marginRight: "1rem" }}
        />
        <button type="submit" style={{ padding: ".5rem 1rem", background: "#ff6f61", color: "#fff", border: "none", borderRadius: "8px" }}>
          登録
        </button>
      </form>
    </div>
  );
}
