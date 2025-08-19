import React, { useState } from "react";
import axios from "axios";

export default function SharePage() {
  const [link, setLink] = useState("");

  const createLink = async () => {
    try {
      const res = await axios.post("/api/create-link");
      const url = `${window.location.origin}/share/${res.data.linkId}`;
      setLink(url);
    } catch (err) {
      console.error(err);
      alert("リンク作成失敗");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>共有リンク発行</h2>
      <button onClick={createLink}>新しいリンクを発行</button>
      {link && (
        <div>
          <p>共有リンク:</p>
          <input value={link} readOnly style={{ width: "80%" }} />
        </div>
      )}
    </div>
  );
}
