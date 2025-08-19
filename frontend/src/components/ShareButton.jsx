import React from "react";

export default function ShareButton({ link }) {
  return (
    <div className="mt-4">
      <p>共有リンク:</p>
      <a href={link} className="text-[#004CA0] underline">{link}</a>
    </div>
  );
}
