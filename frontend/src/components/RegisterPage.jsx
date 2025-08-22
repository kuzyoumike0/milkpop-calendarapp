import React, { useState } from "react";

const RegisterPage = () => {
  const [generatedLink, setGeneratedLink] = useState("");

  // ランダムURLを生成
  const generateShareLink = () => {
    const randomId = Math.random().toString(36).substr(2, 10);
    const url = `${window.location.origin}/share/${randomId}`;
    setGeneratedLink(url);
  };

  // クリックしたらコピー
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    alert("✅ リンクをコピーしました！");
  };

  return (
    <div>
      {/* カレンダー部分の下に追加 */}
      <button className="share-link-button" onClick={generateShareLink}>
        📎 共有リンクを発行
      </button>

      {generatedLink && (
        <div className="generated-link" onClick={copyToClipboard}>
          {generatedLink}
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
