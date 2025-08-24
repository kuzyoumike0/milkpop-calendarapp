import React from "react";
import { FaTwitter, FaDiscord } from "react-icons/fa";

export default function Footer() {
  return (
    <footer>
      <p>© 2025 MilkPOP Calendar</p>
      <div className="footer-links">
        <a
          href="https://x.com/Soni_complaint"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          <FaTwitter className="footer-icon" />
          Twitter
        </a>
        <a
          href="https://discord.gg/337YYw2Z5H"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          <FaDiscord className="footer-icon" />
          Discord
        </a>
      </div>
    </footer>
  );
}
