// frontend/src/components/UsagePage.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../common.css";
import "../usage.css";

export default function UsagePage() {
  return (
    <div className="usage-page">
      <h1 className="page-title">📖 使い方ガイド</h1>
      <p className="intro-text">
        「MilkPOP Calendar」の使い方を、画像付きで分かりやすく説明します。
      </p>

      <section className="usage-section">
        <h2>① トップページ</h2>
        <p>
          サイトの入り口です。ここから日程登録ページや個人スケジュールページへ遷移できます。
        </p>
        {/* 画像をあとから差し替えるスペース */}
        <div className="image-placeholder">ここに画像が入ります</div>
      </section>

      <section className="usage-section">
        <h2>② 日程登録ページ</h2>
        <p>
          イベントや予定を入力して、共有リンクを発行できます。日付選択はカレンダーUIで直感的に行えます。
        </p>
        <div className="image-placeholder">ここに画像が入ります</div>
      </section>

      <section className="usage-section">
        <h2>③ 個人スケジュールページ</h2>
        <p>
          自分専用の予定を登録できます。タイトル・メモ・時間帯・複数日選択など、柔軟にスケジュールを管理できます。
        </p>
        <div className="image-placeholder">ここに画像が入ります</div>
      </section>

      <div className="back-links">
        <Link to="/" className="nav-btn">🏠 トップへ戻る</Link>
      </div>
    </div>
  );
}
