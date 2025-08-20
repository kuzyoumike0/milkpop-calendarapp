import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function LinkPage() {
  const [title, setTitle] = useState("");
  const [dates, setDates] = useState([]);
  const [rangeMode, setRangeMode] = useState("multiple"); // "multiple" or "range"
  const [timeSlot, setTimeSlot] = useState("全日");
  const [schedules, setSchedules] = useState([]);
  const [linkUrl, setLinkUrl] = useState("");

  const navigate = useNavigate();

  // 日付フォーマット
  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // カレンダー日付クリック（複数選択モード）
  const handleClickDay = (value) => {
    const dateStr = formatDate(value);
    if (dates.includes(dateStr)) {
      setDates(dates.filter((d) => d !== dateStr));
    } else {
      setDates([...dates, dateStr]);
    }
  };

  // 範囲選択モード
  const handleChangeRange = (value) => {
    if (Array.isArray(value) && value[0] && value[1]) {
      const start = new Date(value[0]);
      const end = new Date(value[1]);
      const range = [];
      for (
        let d = new Date(start);
        d <= end;
        d.setDate(d.getDate() + 1)
      ) {
        range.push(formatDate(new Date(d)));
      }
      setDates(range);
    }
  };

  // 登録処理
  const handleSubmit = async () => {
    if (!title || dates.length === 0) return alert("タイトルと日付を入力してください");
    const res = await axios.post("/api/schedules", {
      title,
      dates,
      timeslot: timeSlot,
      range_mode: rangeMode,
    });
    setSchedules(res.data);

    // 共有リンクを発行
    if (res.data.length > 0) {
      const linkid = res.data[res.data.length - 1].linkid;
      setLinkUrl(`${window.location.origin}/share/${linkid}`);
    }
  };

  // 共有済みスケジュール取得
  const fetchSchedules = async () => {
    const res = await axios.get("/api/schedules");
    setSchedules(res.data);
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>日程登録ページ</h2>

      <input
        type="text"
        placeholder="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div>
        <label>
          <input
            type="radio"
            value="multiple"
            checked={rangeMode === "multiple"}
            onChange={() => setRangeMode("multiple")}
          />
          複数選択
        </label>
        <label>
          <input
            type="radio"
            value="range"
            checked={rangeMode === "range"}
            onChange={() => setRangeMode("range")}
          />
          範囲選択
        </label>
      </div>

      <Calendar
        selectRange={rangeMode === "range"}
        onClickDay={rangeMode === "multiple" ? handleClickDay : undefined}
        onChange={rangeMode === "range" ? handleChangeRange : undefined}
      />

      <div>選択中: {dates.join(", ")}</div>

      <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
        <option value="全日">全日</option>
        <option value="昼">昼</option>
        <option value="夜">夜</option>
        <option value="時間指定">時間指定（1時〜0時）</option>
      </select>

      <button onClick={handleSubmit}>共有リンク作成</button>

      {linkUrl && (
        <div>
          <p>共有リンク:</p>
          <a href={linkUrl} target="_blank" rel="noreferrer">
            {linkUrl}
          </a>
        </div>
      )}

      <h3>登録済みスケジュール</h3>
      <ul>
        {schedules.map((s) => (
          <li key={s.id}>
            {s.title} - {s.date} - {s.timeslot}
          </li>
        ))}
      </ul>

      <button onClick={() => navigate("/")}>トップへ戻る</button>
    </div>
  );
}
