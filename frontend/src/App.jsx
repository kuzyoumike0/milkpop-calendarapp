import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function CalendarView() {
  const [selectedDates, setSelectedDates] = useState([]);
  const [slotMode, setSlotMode] = useState("allday");
  const [slot, setSlot] = useState("終日");
  const [startTime, setStartTime] = useState("09");
  const [endTime, setEndTime] = useState("18");
  const [title, setTitle] = useState("");
  const [shareUrl, setShareUrl] = useState("");

  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleDateClick = (date) => {
    const formatted = formatDate(date);
    if (selectedDates.includes(formatted)) {
      setSelectedDates(selectedDates.filter((d) => d !== formatted));
    } else {
      setSelectedDates([...selectedDates, formatted]);
    }
  };

  // --- 修正版: POSTで共有リンク発行 ---
  const handleShare = async () => {
    try {
      const res = await axios.post("/api/share-link", {
        dates: selectedDates,
        slotMode,
        slot,
        start_time: startTime,
        end_time: endTime,
        title,
      });
      setShareUrl(res.data.url);
    } catch (err) {
      console.error("共有リンク発行エラー", err);
      alert("共有リンクの発行に失敗しました");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "40px",
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.2)",
          backdropFilter: "blur(12px)",
          borderRadius: "16px",
          padding: "30px",
          width: "600px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
          color: "#fff",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
          📅 カレンダー
        </h1>

        <Calendar
          onClickDay={handleDateClick}
          tileClassName={({ date }) =>
            selectedDates.includes(formatDate(date)) ? "selected-day" : null
          }
        />
        <style>{`
          .selected-day {
            background: #27ae60 !important;
            color: #fff !important;
            border-radius: 50%;
          }
        `}</style>

        <div style={{ marginTop: "20px" }}>
          <input
            type="text"
            placeholder="予定タイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "none",
            }}
          />
        </div>

        {/* 区分選択 */}
        <div style={{ marginTop: "20px" }}>
          <label>
            <input
              type="radio"
              value="allday"
              checked={slotMode === "allday"}
              onChange={() => setSlotMode("allday")}
            />
            終日/昼/夜
          </label>
          <label style={{ marginLeft: "15px" }}>
            <input
              type="radio"
              value="time"
              checked={slotMode === "time"}
              onChange={() => setSlotMode("time")}
            />
            時間指定
          </label>
        </div>

        {slotMode === "allday" ? (
          <select
            value={slot}
            onChange={(e) => setSlot(e.target.value)}
            style={{ marginTop: "10px", width: "100%", padding: "8px" }}
          >
            <option value="終日">終日</option>
            <option value="昼">昼</option>
            <option value="夜">夜</option>
          </select>
        ) : (
          <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
            <select
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              style={{ flex: 1, padding: "8px" }}
            >
              {Array.from({ length: 24 }).map((_, i) => (
                <option key={i} value={String(i).padStart(2, "0")}>
                  {i}:00
                </option>
              ))}
            </select>
            <span>〜</span>
            <select
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              style={{ flex: 1, padding: "8px" }}
            >
              {Array.from({ length: 24 }).map((_, i) => (
                <option key={i} value={String(i).padStart(2, "0")}>
                  {i}:00
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={handleShare}
          style={{
            marginTop: "20px",
            padding: "12px 20px",
            background: "#27ae60",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "1em",
            width: "100%",
          }}
        >
          🔗 共有リンクを発行
        </button>

        {shareUrl && (
          <div
            style={{
              marginTop: "20px",
              padding: "10px",
              background: "#2980b9",
              borderRadius: "8px",
              textAlign: "center",
              wordBreak: "break-all",
            }}
          >
            <span style={{ fontWeight: "bold" }}>共有リンク:</span>
            <br />
            <a
              href={shareUrl}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#fff" }}
            >
              {shareUrl}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
