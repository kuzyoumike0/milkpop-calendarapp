import React from "react";
import LinkCard from "./LinkCard";

export default function LinksSection() {
  const links = [
    {
      href: "https://example.com",
      title: "公式サイト",
      description: "最新情報はこちらから確認できます。",
    },
    {
      href: "https://github.com",
      title: "GitHub",
      description: "ソースコードや開発状況をチェックできます。",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold text-center text-white mb-8">
        🔗 Useful Links
      </h2>
      <div className="grid gap-6 sm:grid-cols-2">
        {links.map((link, index) => (
          <LinkCard key={index} {...link} />
        ))}
      </div>
    </div>
  );
}
