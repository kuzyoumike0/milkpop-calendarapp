import React, { useState } from "react";
import "../index.css";

const daysOfWeek = ["日", "月", "火", "水", "木", "金", "土"];

const RegisterPage = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedDates, setSelectedDates] = useState([]);
  const [title, setTitle] = useState("");
  const [savedSchedules, setSavedSchedules] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc"); // 並び順管理
  const [selectMode, setSelectMode] = useState("single"); // 複数 or 範囲

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  // ===== 日付クリックで選択・解除 or 範囲選択 =====
  const handleDateClick = (date) => {
    if (selectMode === "single") {
      if (selectedDates.includes(date)) {
        setSelectedDates(selectedDates.filter((d) => d !== date));
      } else {
        setSelectedDates([...selectedDates, date]);
      }
    } else if (selectMode === "range") {
      if (selectedDates.length === 0) {
        setSelectedDates([date]);
      } else if (selectedDates.length === 1) {
        const start = Math.min(selectedDates[0], date);
        const end = Math.max(selectedDates[0], date);
        const range = [];
        for (let d = start; d <= end; d++) range.push(d);
        setSelectedDates(range);
      } else {
        setSelectedDates([date]);
      }
    }
  };

  // ===== 選択解除ボタン =====
  const handleRemoveSelected = (date) => {
    setSelectedDates(selectedDates.filter((d) => d !== date));
  };

  // ===== 月切り替え =====
  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  // ===== 保存処理 =====
  const handleSave = () => {
    if (!title || selectedDates.length === 0) {
      alert("タイトルと日付を入力してください！");
      return;
    }
    const sortedDates = [...selectedDates].sort((a, b) => a - b);
    setSavedSchedules([
      ...savedSchedules,
      { id: Date.now(), title, dates: sortedDates, month, year },
    ]);
    setTitle("");
    setSelectedDates([]);
  };

  // ===== 削除処理（保存済み） =====
  const handleDelete = (id) => {
    setSavedSchedules(savedSchedules.filter((s) => s.id !== id));
  };

  // ===== 並び替え =====
  const sortedSchedules = [...savedSchedules].sort((a, b) => {
    const dateA = new Date(a.year, a.month, a.dates[0]);
    const dateB = new Date(b.year, b.month, b.dates[0]);
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  // ===== 選択済みを昇順で表示 =====
  const sortedSelectedDates = [...selectedDates].sort((a, b) => a - b);

  return (
    <div className="register-page">
      <div className="banner">MilkPOP Calendar</div>

      {/* ===== タイトル・モード選択エリア ===== */}
      <div className="form-top">
        <div className="form-group short-input">
          <label>タイトル</label>
          <input
            type="text"
            value={title}
            placeholder="予定タイトルを入力"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group radio-group">
          <label>選択モード</label>
          <div className="radio-options">
            <label className="radio-label">
              <input
                type="radio"
                value="single"
                checked={selectMode === "single"}
                onChange={(e) => setSelectMode(e.target.value)}
              />
              <span className="custom-radio"></span> 複数選択
            </label>
            <label className="radio-label">
              <input
                type="radio"
                value="range"
                checked={selectMode === "range"}
                onChange={(e) => setSelectMode(e.target.value)}
              />
              <span className="custom-radio"></span> 範囲選択
            </label>
          </div>
        </div>
      </div>

      <div className="register-layout">
        {/* ===== 左：カレンダー 7割 ===== */}
        <div className="calendar-section">
          <h2 className="form-title">
            {year}年 {month + 1}月
          </h2>
          <div className="calendar-nav">
            <button onClick={prevMonth}>← 前の月</button>
            <button onClick={nextMonth}>次の月 →</button>
          </div>
