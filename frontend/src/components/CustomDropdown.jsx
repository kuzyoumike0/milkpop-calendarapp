import React, { useState, useRef, useEffect } from "react";
import "../register.css";

const CustomDropdown = ({ value, onChange, max = 24 }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const hours = Array.from({ length: max + 1 }, (_, i) => `${i}:00`);

  const handleSelect = (hour) => {
    onChange(hour.replace(":00", "")); // 親に数値を渡す
    setOpen(false);
  };

  // ドロップダウン外をクリックしたら閉じる
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="custom-dropdown" ref={dropdownRef}>
      <button
        className="custom-dropdown-toggle"
        onClick={() => setOpen(!open)}
      >
        {value}:00 ▼
      </button>
      {open && (
        <ul className="custom-dropdown-menu">
          {hours.map((h, idx) => (
            <li
              key={h}
              className={`custom-dropdown-item ${
                value === h.replace(":00", "") ? "selected" : ""
              } ${idx % 2 === 0 ? "even" : "odd"}`}
              onClick={() => handleSelect(h)}
            >
              {h}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomDropdown;
