import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function SharePage() {
  const [shareLinks, setShareLinks] = useState([]);

  const generateLink = () => {
    const newLink = `/shared/${Date.now()}`;
    setShareLinks([...shareLinks, newLink]);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>📅 共有カレンダー</h1>
      <button onClick={generateLink}>🔗 共有リンクを発行</button>
      <ul>
        {shareLinks.map((link, i) => (
          <li key={i}>
            <Link to={link}>{window.location.origin}{link}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
