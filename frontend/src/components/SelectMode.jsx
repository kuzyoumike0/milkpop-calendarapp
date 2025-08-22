// frontend/src/components/SelectMode.jsx
import React from "react";
import "../index.css";

const SelectMode = ({ mode, setMode }) => {
  return (
    <div className="mode-selector">
      <label className="mode-option">
        <input
          type="radio"
          name="mode"
          value="range"
          checked={mode === "range"}
          onChange={() => setMode("range")}
        />
        <span>📌 範囲選択</span>
      </label>

      <label className="mode-option">
        <input
          type="radio"
          name="mode"
          value="multi"
          checked={mode === "multi"}
          onChange={() => setMode("multi")}
        />
        <span>✅ 複数選択</span>
      </label>
    </div>
  );
};

export default SelectMode;
