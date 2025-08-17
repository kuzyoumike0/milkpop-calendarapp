import React, { useState } from "react";
import CustomCalendar from "../components/CustomCalendar";

export default function SharedPage() {
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");

  const generateLink = () => {
    const uniqueId = Math.random().toString(36).substring(2, 10);
    setLink(window.location.origin + "/shared/" + uniqueId);
  };

  return (
    <div className="container">
      <h2>共有スケジュール</h2>
      <input
        type="text"
        placeholder="タイトルを入力"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{padding:"0.5rem", width:"100%", marginBottom:"1rem"}}
      />
      <CustomCalendar />
      <button onClick={generateLink}>共有リンクを発行</button>
      {link && (
        <p>
          <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
        </p>
      )}
    </div>
  );
}
