import React, { useState } from "react";
import CustomCalendar from "./CustomCalendar";
import "../index.css";

const RegisterPage = () => {
  const [selectionMode, setSelectionMode] = useState("range"); // range or multiple
  const [selectedDates, setSelectedDates] = useState([]);
  const [title, setTitle] = useState("");
  const [timeOptions, setTimeOptions] = useState({}); // 日付ごとの時間帯

  // 日付選択時の処理
  const handleSelectDates = (dates) => {
    setSelectedDates(dates);
  };

  // 時間帯変更
  const handleTimeChange = (dateStr, value) => {
    setTimeOptions((prev) => ({ ...prev, [dateStr]: value }));
  };

  // ランダムなURL生成
  const generateLink = () => {
    const randomString = Math.random().toString(36).substring(2, 10);
    return `${window.location.origin}/share/${randomString}`;
  };

  const [shareUrl, setShareUrl] = useState("");

  return (
    <div className="page-container">
      <h1 className="page-title">📅 日程登録ページ</h1>

      {/* タイトル入力 */}
      <div className="form-group">
        <label>タイトル：</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-input"
          placeholder="イベントのタイトルを入力"
        />
      </div>

      {/* 選択モード */}
      <div className="form-group">
        <label>選択モード：</label>
        <label>
          <input
            type="radio"
            value="range"
            checked={selectionMode === "range"}
            onChange={() => setSelectionMode("range")}
          />
          範囲選択
        </label>
        <label>
          <input
            type="radio"
            value="multiple"
            checked={selectionMode === "multiple"}
            onChange={() => setSelectionMode("multiple")}
          />
          複数選択
        </label>
      </div>

      {/* カレンダー */}
      <CustomCalendar
        selectionMode={selectionMode}
        onSelectDates={handleSelectDates}
      />

      {/* 選択した日付リスト */}
      <div className="selected-dates">
        <h2>選択した日程</h2>
        {selectedDates.length === 0 && <p>日付を選択してください。</p>}
        {selectedDates.map((d, i) => {
          const dateStr = d.toLocaleDateString("ja-JP");
          return (
            <div key={i} className="date-row">
              <span>{dateStr}</span>
              <select
                value={timeOptions[dateStr] || ""}
                onChange={(e) => handleTimeChange(dateStr, e.target.value)}
                className="select-input"
              >
                <option value="">時間を選択</option>
                <option value="all">終日</option>
                <option value="day">昼</option>
                <option value="night">夜</option>
                <option value="custom">時刻指定</option>
              </select>
              {/* 時刻指定が選ばれたら追加のプルダウン */}
              {timeOptions[dateStr] === "custom" && (
                <div className="time-range">
                  <select>
                    {Array.from({ length: 24 }).map((_, h) => (
                      <option key={h} value={h}>
                        {h}:00
                      </option>
                    ))}
                  </select>
                  ～
                  <select>
                    {Array.from({ length: 24 }).map((_, h) => (
                      <option key={h} value={h}>
                        {h}:00
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 共有リンクボタン */}
      <div className="form-group">
        <button
          className="share-button"
          onClick={() => setShareUrl(generateLink())}
        >
          🔗 共有リンクを発行
        </button>
        {shareUrl && (
          <p className="share-url">
            <a href={shareUrl} target="_blank" rel="noopener noreferrer">
              {shareUrl}
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
