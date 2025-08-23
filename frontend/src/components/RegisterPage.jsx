import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // 既存のカレンダーCSSを読み込み
import "../index.css"; // 自作CSSで上書き

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date());
  const [selectionMode, setSelectionMode] = useState("range");
  const [timeType, setTimeType] = useState("allDay");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");

  const handleSave = async () => {
    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          date,
          selectionMode,
          timeType,
          startTime: timeType === "custom" ? startTime : null,
          endTime: timeType === "custom" ? endTime : null,
        }),
      });

      if (!res.ok) throw new Error("保存に失敗しました");
      alert("登録しました！");
      setTitle("");
    } catch (err) {
      console.error(err);
      alert("エラーが発生しました");
    }
  };

  return (
    <div className="register-page">
      {/* バナー */}
      <header className="banner">
        <h1>MilkPOP Calendar</h1>
      </header>

      <div className="form-container">
        {/* タイトル入力 */}
        <div className="form-group">
          <label>タイトル</label>
          <input
            type="text"
            placeholder="タイトルを入力してください"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* ラジオボタン */}
        <div className="form-group">
          <h2>選択方法</h2>
          <div className="radio-group">
            <label className={`radio-label ${selectionMode === "range" ? "radio-active" : ""}`}>
              <input
                type="radio"
                name="selectionMode"
                value="range"
                checked={selectionMode === "range"}
                onChange={() => setSelectionMode("range")}
              />
              範囲選択
            </label>
            <label className={`radio-label ${selectionMode === "multiple" ? "radio-active" : ""}`}>
              <input
                type="radio"
                name="selectionMode"
                value="multiple"
                checked={selectionMode === "multiple"}
                onChange={() => setSelectionMode("multiple")}
              />
              複数選択
            </label>
          </div>
        </div>

        {/* カレンダー */}
        <div className="custom-calendar">
          <Calendar
            onChange={setDate}
            value={date}
            selectRange={selectionMode === "range"}
          />
        </div>

        {/* 時間帯 */}
        <div className="form-group">
          <h2>時間帯</h2>
          <select value={timeType} onChange={(e) => setTimeType(e.target.value)}>
            <option value="allDay">終日</option>
            <option value="morning">午前</option>
            <option value="afternoon">午後</option>
            <option value="custom">時間指定</option>
          </select>

          {timeType === "custom" && (
            <div className="time-inputs">
              <div>
                <label>開始時刻</label>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div>
                <label>終了時刻</label>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>
          )}
        </div>

        {/* 保存ボタン */}
        <button className="save-btn" onClick={handleSave}>
          登録する
        </button>
      </div>
    </div>
  );
};

export default RegisterPage;
