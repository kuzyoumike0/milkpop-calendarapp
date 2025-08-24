import React from "react";
import "../index.css";

const Footer = () => {
  return (
    <footer>
      <p>© 2025 MilkPOP Calendar</p>

      <div className="footer-links">
        {/* Discordサーバー招待URL */}
        <a
          href="https://discord.gg/xxxxxx" // ← あなたのDiscordサーバー招待URLに変更
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          <img src="/discord-icon.png" alt="Discord" className="footer-icon" />
          Discordサーバー
        </a>

        {/* Twitterアカウント */}
        <a
          href="https://twitter.com/your_account" // ← あなたのTwitterアカウントURLに変更
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          <img src="/twitter-icon.png" alt="Twitter" className="footer-icon" />
          Twitter
        </a>
      </div>
    </footer>
  );
};

export default Footer;
