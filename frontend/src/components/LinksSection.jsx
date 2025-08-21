import React, { useEffect, useState } from "react";
import LinkCard from "./LinkCard";

export default function LinksSection() {
  const [links, setLinks] = useState([]);

  useEffect(() => {
    // API からデータ取得
    fetch("/api/links")
      .then((res) => res.json())
      .then((data) => setLinks(data))
      .catch((err) => console.error("API fetch error:", err));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold text-center text-white mb-8">
        🔗 Useful Links
      </h2>
      {links.length === 0 ? (
        <p className="text-center text-gray-400">リンクがありません。</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {links.map((link) => (
            <LinkCard
              key={link.id}
              href={link.url}
              title={link.title}
              description={link.description}
            />
          ))}
        </div>
      )}
    </div>
  );
}
