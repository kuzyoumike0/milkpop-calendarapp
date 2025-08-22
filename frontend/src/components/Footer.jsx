import React from "react";
import "../index.css";

const Footer = () => {
  return (
    <>
      <footer className="footer">
        <p>© 2025 MilkPOP Calendar. All rights reserved.</p>
      </footer>
      {/* フッター下に画像 */}
      <div className="footer-image">
        <img src="/footer-bg.png" alt="Footer Background" />
      </div>
    </>
  );
};

export default Footer;
