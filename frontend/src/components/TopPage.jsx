// frontend/src/components/TopPage.jsx
import React from "react";
import { Link } from "react-router-dom";

function TopPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <Link to="/link" className="...">
          <h2>日程登録ページ</h2>
          <p>自作カレンダーに日程を登録し、共有リンクを発行できます。</p>
        </Link>

        <Link to="/personal" className="...">
          <h2>個人スケジュール</h2>
          <p>タイトルやメモ、時間帯を設定して、自分専用の予定を管理できます。</p>
        </Link>
      </div>
    </div>
  );
}

export default TopPage;
