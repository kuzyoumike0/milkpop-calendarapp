import React from "react";

export default function ShareButton({ link }) {
  if (!link) return null;
  return (
    <div>
      <p>共有リンク: <a href={link}>{link}</a></p>
    </div>
  );
}
