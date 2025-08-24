import React from "react";

const Dropdown = ({ value, onChange }) => {
  return (
    <select
      className="custom-dropdown"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="allday">🌞 終日</option>
      <option value="day">🌅 午前</option>
      <option value="night">🌙 午後</option>
      <option value="custom">⏰ 時間指定</option>
    </select>
  );
};

export default Dropdown;
