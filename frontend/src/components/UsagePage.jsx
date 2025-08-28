import React from "react";
import "../usage.css";

const UsagePage = () => {
  return (
    <div className="usage-page">
      <h1 className="usage-title">📖 MilkPOP Calendar の使い方</h1>

      <section>
        <h2>1. トップページ</h2>
        <p>
          サイトの入り口です。ここから「日程登録ページ」「個人スケジュールページ」に移動できます。
        </p>
      </section>

      <section>
        <h2>2. 日程登録ページ</h2>
        <ul>
          <li>タイトルを入力し、カレンダーから日程を選びます。</li>
          <li>終日 / 昼 / 夜 / 時間指定（開始時刻〜終了時刻）を選べます。</li>
          <li>登録すると共有リンクが発行されます。</li>
          <li>リンクを他の人に送ると、出欠を回答してもらえます。</li>
        </ul>
      </section>

      <section>
        <h2>3. 個人スケジュールページ</h2>
        <ul>
          <li>Discord ログインが必要です。</li>
          <li>タイトルとメモを入力し、カレンダーから予定を選びます。</li>
          <li>登録すると、一覧にすぐ反映されます。</li>
          <li>自分だけの予定を管理するのに便利です。</li>
        </ul>
      </section>

      <section>
        <h2>4. 共有ページ</h2>
        <ul>
          <li>発行されたリンクからアクセスできます。</li>
          <li>出欠（〇/✖/△）を選んで保存すると即時反映されます。</li>
          <li>参加者の一覧と回答が表で見やすく表示されます。</li>
        </ul>
      </section>

      <section>
        <h2>5. デザインと使いやすさ</h2>
        <p>
          MilkPOP Calendar は <span style={{ color: "#FDB9C8" }}>#FDB9C8</span> と{" "}
          <span style={{ color: "#004CA0" }}>#004CA0</span> を基調にした、お洒落でシンプルなデザインです。
        </p>
      </section>
    </div>
  );
};

export default UsagePage;
