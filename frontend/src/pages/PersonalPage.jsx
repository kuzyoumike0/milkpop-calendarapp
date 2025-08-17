import React from "react";
import CustomCalendar from "../components/CustomCalendar";

export default function PersonalPage() {
  return (
    <div style={{ padding: "20px" }}>
      <h2>個人スケジュール</h2>
      <input type="text" placeholder="タイトルを入力" />
      <CustomCalendar />
    </div>
  );
}
