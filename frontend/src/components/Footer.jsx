import React from "react";
import "../index.css";

const Footer = () => {
  return (
    <footer>
      <p>© 2025 MilkPOP Calendar</p>

      <div className="footer-links">
        {/* Discordサーバー招待URL */}
        <a
          href="https://discord.gg/xxxxxx" // ← あなたのサーバー招待URLに変更
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          <img
            src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/discord.svg"
          
            className="footer-icon"
          />
        </a>

        {/* Twitterアカウント */}
        <a
          href="https://x.com/Soni_complaint" // ← あなたのTwitterアカウントに変更
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          <img
            src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/twitter.svg"
          
            className="footer-icon"
          />

        </a>
      </div>
    </footer>
  );
};

export default Footer;
