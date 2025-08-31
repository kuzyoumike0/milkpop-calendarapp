import React, { useEffect } from "react";
import { FaTwitter, FaDiscord } from "react-icons/fa";

export default function Footer() {
  useEffect(() => {
    try {
      // 広告の再読み込み（AdSense公式推奨）
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  return (
    <footer className="footer">
      <p>© 2025 MilkPOP Calendar</p>

      {/* SNS リンク */}
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

      {/* ✅ Google AdSense 広告枠 */}
      <div className="ads-container">
        <ins
          className="adsbygoogle"
          style={{ display: "block", margin: "20px auto", textAlign: "center" }}
          data-ad-client="ca-pub-1851621870746917"
          data-ad-slot="1234567890" /* ← AdSense 管理画面の広告ユニットIDに置き換え */
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </footer>
  );
}
