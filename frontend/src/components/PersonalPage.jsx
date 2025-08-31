// frontend/src/components/PersonalPage.jsx
import React, { useState, useEffect } from "react";
import Holidays from "date-holidays";
import "../personal.css";

import {
  listPersonalEvents,
  createPersonalEvent,
  updatePersonalEvent,
  deletePersonalEvent,
  createPersonalShareLink,
} from "./db.js"; // ✅ フロント用 API クライアント

export default function PersonalPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState({});
  const [mode, setMode] = useState("multiple");
  const [rangeStart, setRangeStart] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [shareLink, setShareLink] = useState("");
  const [editedSchedules, setEditedSchedules] = useState({});

  const hd = new Holidays("JP");
  const todayIso = new Date().toISOString().split("T")[0];

  // ==== 初回読み込み ====
  useEffect(() => {
    refreshSchedules();
  }, []);

  const refreshSchedules = async () => {
    try {
      const data = await listPersonalEvents();
      setSchedules(data);
    } catch (err) {
      console.error("❌ 個人スケジュール取得失敗:", err);
    }
  };

  const toggleDate = (iso) => {
    if (mode === "multiple") {
      setSelectedDates((prev) => ({
        ...prev,
        [iso]: !prev[iso],
      }));
    } else if (mode === "range") {
      if (!rangeStart) {
        setRangeStart(iso);
        setSelectedDates({ [iso]: true });
      } else {
        const start = new Date(rangeStart);
        const end = new Date(iso);
        if (start > end) [start, end] = [end, start];
        const range = {};
        for (
          let d = new Date(start);
          d <= end;
          d.setDate(d.getDate() + 1)
        ) {
          range[d.toISOString().split("T")[0]] = true;
        }
        setSelectedDates(range);
        setRangeStart(null);
      }
    }
  };

  const saveSchedule = async () => {
    const dates = Object.keys(selectedDates)
      .filter((d) => selectedDates[d])
      .map((d) => ({
        date: d,
        timeType: "allday",
      }));

    if (!title || dates.length === 0) {
      alert("タイトルと日程を入力してください");
      return;
    }

    try {
      if (editingId) {
        await updatePersonalEvent(editingId, { title, memo, dates });
      } else {
        await createPersonalEvent({ title, memo, dates });
      }
      setTitle("");
      setMemo("");
      setSelectedDates({});
      setEditingId(null);
      await refreshSchedules();
    } catch (err) {
      console.error("❌ 保存失敗:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("削除しますか？")) return;
    try {
      await deletePersonalEvent(id);
      await refreshSchedules();
    } catch (err) {
      console.error("❌ 削除失敗:", err);
    }
  };

  const handleShare = async (id) => {
    try {
      const res = await createPersonalShareLink(id);
      setShareLink(res.share_url);
    } catch (err) {
      console.error("❌ 共有リンク発行失敗:", err);
    }
  };

  return (
    <div className="personal-page">
      <h2>個人スケジュール登録</h2>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="タイトル"
      />
      <textarea
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        placeholder="メモ"
      />

      {/* TODO: カレンダーUI（祝日対応、複数選択/範囲選択） */}
      {/* 今は簡易版 */}
      <div>
        <button onClick={() => setMode("multiple")}>複数選択</button>
        <button onClick={() => setMode("range")}>範囲選択</button>
      </div>

      <div>
        選択日:{" "}
        {Object.keys(selectedDates)
          .filter((d) => selectedDates[d])
          .join(", ")}
      </div>

      <button onClick={saveSchedule}>
        {editingId ? "更新" : "登録"}
      </button>

      {shareLink && (
        <div>
          共有リンク: <a href={shareLink}>{shareLink}</a>
        </div>
      )}

      <h3>登録済みスケジュール</h3>
      <ul>
        {schedules.map((s) => (
          <li key={s.id}>
            <b>{s.title}</b> ({s.dates.map((d) => d.date).join(", ")})
            <button onClick={() => setEditingId(s.id)}>編集</button>
            <button onClick={() => handleDelete(s.id)}>削除</button>
            <button onClick={() => handleShare(s.id)}>共有</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
