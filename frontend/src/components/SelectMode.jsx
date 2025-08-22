// frontend/src/components/SelectMode.jsx
import React from "react";
import "../index.css";

const SelectMode = ({ mode, setMode }) => {
  return (
    <div className="radio-group">
      <label className={`radio-option ${mode === "range" ? "active" : ""}`}>
        <input
          type="radio"
          name="selectMode"
          value="range"
          checked={mode === "range"}
          onChange={(e) => setMode(e.target.value)}
        />
        <span>範囲選択</span>
      </label>

      <label className={`radio-option ${mode === "multi" ? "active" : ""}`}>
        <input
          type="radio"
          name="selectMode"
          value="multi"
          checked={mode === "multi"}
          onChange={(e) => setMode(e.target.value)}
        />
        <span>複数選択</span>
      </label>
    </div>
  );
};

export default SelectMode;
