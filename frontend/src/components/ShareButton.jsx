import React from "react";

export default function ShareButton({ link }) {
  return (
    link ? (
      <p style={{ marginTop:"15px" }}>
        共有リンク: <a href={link} target="_blank" rel="noreferrer">{link}</a>
      </p>
    ) : null
  );
}
