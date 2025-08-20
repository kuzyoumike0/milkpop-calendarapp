import React, { useState } from "react";
import DatePicker from "react-multi-date-picker";
import DatePanel from "react-multi-date-picker/plugins/date_panel";
import "react-multi-date-picker/styles/colors/purple.css";
import Holidays from "date-holidays";

export default function CustomCalendar({ rangeMode, onChange }) {
  const [value, setValue] = useState([]);

  // 日本の祝日を取得
  const hd = new Holidays("JP");
  const holidays = hd.getHolidays(new Date().getFullYear()).map(h => h.date);

  const handleChange = (val) => {
    setValue(val);
    if (onChange) onChange(val);
  };

  return (
    <div style={{ margin: "20px auto" }}>
      <DatePicker
        value={value}
        onChange={handleChange}
        multiple={rangeMode === "multiple"}
        range={rangeMode === "range"}
        plugins={[<DatePanel />]}
        format="YYYY-MM-DD"
        style={{ padding: "10px", border: "2px solid #004CA0", borderRadius: "8px" }}
        mapDays={({ date }) => {
          let props = {};
          let isHoliday = holidays.includes(date.format("YYYY-MM-DD"));
          if (isHoliday) {
            props.style = { color: "#FDB9C8", fontWeight: "bold" };
          }
          return props;
        }}
      />
    </div>
  );
}
