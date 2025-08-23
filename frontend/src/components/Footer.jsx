// frontend/src/components/Footer.jsx
import React from "react";
import { FaTwitter } from "react-icons/fa"; // ← アイコン追加

const Footer = () => {
  return (
    <footer>
      <p>© 2025 MilkPOP Calendar - All Rights Reserved</p>
      <div className="sns-links">
        <a
          href="https://twitter.com/your_account" // ← あなたのTwitterアカウントURL
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaTwitter />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
