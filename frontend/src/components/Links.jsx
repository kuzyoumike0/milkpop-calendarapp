import React, { useEffect, useState } from "react";
import LinkCard from "./LinkCard";

export default function Links() {
  const [links, setLinks] = useState([]);

  useEffect(() => {
    // APIからリンク取得（例: /api/links）
    fetch("/api/links")
      .then((res) => res.json())
      .then((data) => setLinks(data))
      .catch((err) => console.error("リンク取得失敗:", err));
  }, []);

  return (
    <div className="flex flex-wrap">
      {links.map((link, i) => (
        <LinkCard key={i} link={link} />
      ))}
    </div>
  );
}
