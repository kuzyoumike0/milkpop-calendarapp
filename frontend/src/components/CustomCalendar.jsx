import React from "react";
import DatePicker from "react-multi-date-picker";

export default function CustomCalendar({ rangeMode, dates, setDates }) {
  return (
    <div style={{ margin: "20px 0" }}>
      <DatePicker
        value={dates}
        onChange={setDates}
        range={rangeMode === "range"}
        multiple={rangeMode === "multiple"}
        format="YYYY-MM-DD"
        style={{ padding: "10px", borderRadius: "6px" }}
      />
    </div>
  );
}
