import React, { useState, useRef, useEffect } from "react";
import "../index.css";

const options = [
  { value: "allday", label: "🌞 終日" },
  { value: "morning", label: "☀ 午前" },
  { value: "afternoon", label: "🌇 午後" },
  { value: "custom", label: "⏰ 時間指定" },
];

const Dropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value) || options[0];

  return (
    <div className="dropdown" ref={ref}>
      <button className="dropdown-btn" onClick={() => setOpen(!open)}>
        {selected.label} <span className="arrow">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <ul className="dropdown-list">
          {options.map((opt) => (
            <li
              key={opt.value}
              className="dropdown-item"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
