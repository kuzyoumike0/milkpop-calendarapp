// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import SelectMode from "./SelectMode";
import "../index.css";
import { v4 as uuidv4 } from "uuid"; // URL用ID発行

const RegisterPage = () => {
  const [mode, setMode] = useState("range");
  const [selectedDates, setSelectedDates] = useState([]);
  const navigate = useNavigate();

  // ダミー保存関数（本来はバックエンドAPIにPOST）
  const handleSave = () => {
    const newId = uuidv4(); // ランダムID生成
    localStorage.setItem(newId, JSON.stringify({
      mode,
      selectedDates
    }));

    // 共有URLに遷移
    navigate(`/share/${newId}`);
  };

  return (
    <div className="page-container">
      <h2 className="page-title">日程登録ページ</h2>

      <SelectMode mode={mode} setMode={setMode} />

      <div className="calendar-wrapper">
        <Calendar
          onClickDay={(date) => setSelectedDates([...selectedDates, date])}
        />
      </div>

      <button className="btn" onClick={handleSave}>
        共有リンクを発行
      </button>
    </div>
  );
};

export default RegisterPage;
